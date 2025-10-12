/**
 * Setup GitHub Secrets
 *
 * Automatically configures required secrets for GitHub Actions
 */

import { Octokit } from '@octokit/rest';
import * as sodium from 'sodium-native';
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
    } catch (error: any) {
      console.error(`✗ Failed to set ${secret.name}:`, error.message);
    }
  }

  console.log('\n🎉 Secrets setup complete!');
  console.log('\nConfigured secrets:');
  secrets.forEach((s) => {
    if (s.value) {
      console.log(`  ✓ ${s.name}`);
    }
  });

  console.log('\n📋 Next steps:');
  console.log('  1. Create an Issue on GitHub');
  console.log('  2. Add label "🤖agent-execute" or comment "/agent"');
  console.log('  3. Watch the AI agents work!');
}

function encryptSecret(secretValue: string, publicKey: string): string {
  // Decode the base64 public key
  const keyBuffer = Buffer.from(publicKey, 'base64');

  // Convert secret to buffer
  const messageBuffer = Buffer.from(secretValue, 'utf-8');

  // Allocate buffer for encrypted message
  const encryptedBuffer = Buffer.alloc(
    messageBuffer.length + sodium.crypto_box_SEALBYTES
  );

  // Encrypt using libsodium sealed box
  sodium.crypto_box_seal(encryptedBuffer, messageBuffer, keyBuffer);

  // Return as base64
  return encryptedBuffer.toString('base64');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupSecrets().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}
