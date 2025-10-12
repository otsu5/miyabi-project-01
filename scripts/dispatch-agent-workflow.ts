/**
 * Manually dispatch autonomous agent workflow
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function dispatchWorkflow() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';
  const issueNumber = 1;

  const octokit = new Octokit({ auth: token });

  console.log(`🚀 Dispatching Autonomous Agent workflow for Issue #${issueNumber}...`);

  try {
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: 'autonomous-agent.yml',
      ref: 'main',
      inputs: {
        issue_number: String(issueNumber)
      }
    });

    console.log('✅ Workflow dispatched successfully!');
    console.log(`\n⏳ Workflow should start in a few moments...`);
    console.log(`📊 Monitor: https://github.com/${owner}/${repo}/actions`);
    console.log(`📝 Issue: https://github.com/${owner}/${repo}/issues/${issueNumber}`);
  } catch (error: any) {
    console.error('❌ Failed to dispatch workflow:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

dispatchWorkflow().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
