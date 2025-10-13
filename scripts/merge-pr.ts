/**
 * Merge PR
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function mergePR() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';
  const pull_number = 2;

  const octokit = new Octokit({ auth: token });

  console.log(`🔄 Merging PR #${pull_number}...`);

  // Mark PR as ready for review (remove draft status)
  await octokit.pulls.update({
    owner,
    repo,
    pull_number,
    draft: false
  });

  console.log('✅ PR marked as ready for review');
  console.log('⏳ Waiting 5 seconds for status to propagate...');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Merge PR
  const { data: merge } = await octokit.pulls.merge({
    owner,
    repo,
    pull_number,
    commit_title: 'feat: autonomous agent implementation for issue #1',
    commit_message: `Merge AI-generated code from autonomous agent

- Multi-language greeting function (EN/JA/ES)
- Comprehensive test suite
- Vitest globals configuration

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>`,
    merge_method: 'squash'
  });

  console.log(`✅ PR merged: ${merge.merged ? 'Success' : 'Failed'}`);
  console.log(`   SHA: ${merge.sha}`);
}

mergePR().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
