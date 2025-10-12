/**
 * Get workflow run logs
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function getWorkflowLogs() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';
  const run_id = 18450118116;

  const octokit = new Octokit({ auth: token });

  console.log(`🔍 Fetching logs for workflow run: ${run_id}\n`);

  // Get jobs for this run
  const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
    owner,
    repo,
    run_id
  });

  for (const job of jobs.jobs) {
    if (job.name === 'Execute Autonomous Agents') {
      console.log(`📋 Job: ${job.name} (ID: ${job.id})\n`);

      // Get job logs
      try {
        const { data: logs } = await octokit.actions.downloadJobLogsForWorkflowRun({
          owner,
          repo,
          job_id: job.id
        });

        console.log('Job Logs:');
        console.log('─'.repeat(80));
        console.log(logs);
        console.log('─'.repeat(80));
      } catch (error: any) {
        console.error('Failed to download logs:', error.message);
      }
    }
  }
}

getWorkflowLogs().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
