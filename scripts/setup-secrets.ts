/**
 * Setup GitHub Secrets
 *
 * Automatically configures required secrets for GitHub Actions
 */

import { Octokit } from '@octokit/rest';
import sodium from 'libsodium-wrappers';
import * as dotenv from 'dotenv';

dotenv.config();

interface Secret {
  name: string;
  value: string;
}

async function setupSecrets() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const repository = process.env.REPOSITORY || 'otsu5/miyabi-project-01';
  const [owner, repo] = repository.split('/');

  console.log(`🔐 Setting up secrets for ${owner}/${repo}...`);

  const octokit = new Octokit({ auth: token });

  // Initialize sodium
  await sodium.ready;

  // Get repository public key for encryption
  const { data: publicKeyData } = await octokit.actions.getRepoPublicKey({
    owner,
    repo,
  });

  console.log(`✓ Retrieved public key: ${publicKeyData.key_id}`);

  // Define secrets to set
  const secrets: Secret[] = [
    {
      name: 'GEMINI_API_KEY',
      value: process.env.GEMINI_API_KEY || '',
    },
    {
      name: 'OPENAI_API_KEY',
      value: process.env.OPENAI_API_KEY || '',
    },
    {
      name: 'ANTHROPIC_API_KEY',
      value: process.env.ANTHROPIC_API_KEY || '',
    },
  ];

  // Set each secret
  let successCount = 0;
  for (const secret of secrets) {
    if (!secret.value) {
      console.log(`⚠ Skipping ${secret.name} (not found in .env)`);
      continue;
    }

    try {
      // Encrypt the secret
      const encryptedValue = encryptSecret(secret.value, publicKeyData.key);

      // Create or update the secret
      await octokit.actions.createOrUpdateRepoSecret({
        owner,
        repo,
        secret_name: secret.name,
        encrypted_value: encryptedValue,
        key_id: publicKeyData.key_id,
      });

      console.log(`✓ Set ${secret.name}`);
      successCount++;
    } catch (error: any) {
      console.error(`✗ Failed to set ${secret.name}:`, error.message);
    }
  }

  console.log(`\n🎉 Secrets setup complete! (${successCount}/${secrets.length} configured)`);

  if (successCount > 0) {
    console.log('\n✅ Configured secrets:');
    secrets.forEach((s) => {
      if (s.value) {
        console.log(`  ✓ ${s.name}`);
      }
    });

    console.log('\n📋 Next steps:');
    console.log('  1. Create an Issue on GitHub');
    console.log('  2. Add label "🤖agent-execute" or comment "/agent"');
    console.log('  3. Watch the AI agents work!');
    console.log('\n📊 View your repository:');
    console.log(`  https://github.com/${owner}/${repo}`);
  }
}

function encryptSecret(secretValue: string, publicKey: string): string {
  // Convert the public key from base64
  const publicKeyUint8 = sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL);

  // Convert the secret to Uint8Array
  const messageUint8 = sodium.from_string(secretValue);

  // Encrypt using libsodium sealed box
  const encryptedUint8 = sodium.crypto_box_seal(messageUint8, publicKeyUint8);

  // Convert to base64
  return sodium.to_base64(encryptedUint8, sodium.base64_variants.ORIGINAL);
}

// Run immediately
setupSecrets().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  console.error(error);
  process.exit(1);
});
