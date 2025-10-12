/**
 * Check Pull Requests
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPRs() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';

  const octokit = new Octokit({ auth: token });

  console.log('📋 Checking Pull Requests...\n');

  const { data: prs } = await octokit.pulls.list({
    owner,
    repo,
    state: 'open',
    per_page: 10
  });

  if (prs.length === 0) {
    console.log('No open pull requests found.');
    return;
  }

  console.log(`Found ${prs.length} open PR(s):\n`);

  for (const pr of prs) {
    console.log(`#${pr.number}: ${pr.title}`);
    console.log(`   State: ${pr.state}`);
    console.log(`   Draft: ${pr.draft}`);
    console.log(`   Branch: ${pr.head.ref} → ${pr.base.ref}`);
    console.log(`   Author: ${pr.user?.login}`);
    console.log(`   Created: ${new Date(pr.created_at).toLocaleString('ja-JP')}`);
    console.log(`   🔗 ${pr.html_url}`);
    console.log('');
  }
}

checkPRs().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
