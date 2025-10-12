/**
 * Manually trigger autonomous agent workflow for an issue
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function triggerAgent() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';
  const issueNumber = 1;

  const octokit = new Octokit({ auth: token });

  console.log(`🚀 Triggering autonomous agent for Issue #${issueNumber}...`);

  // Remove the agent-failed label if present
  try {
    await octokit.issues.removeLabel({
      owner,
      repo,
      issue_number: issueNumber,
      name: '❌agent-failed'
    });
    console.log('✅ Removed ❌agent-failed label');
  } catch (error: any) {
    if (error.status !== 404) {
      console.warn('Could not remove agent-failed label:', error.message);
    }
  }

  // Re-add the agent-execute label to trigger the workflow
  await octokit.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: ['🤖agent-execute']
  });

  console.log('✅ Re-added 🤖agent-execute label');
  console.log(`\n⏳ Workflow should start in a few moments...`);
  console.log(`📊 Monitor: https://github.com/${owner}/${repo}/actions`);
}

triggerAgent().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
