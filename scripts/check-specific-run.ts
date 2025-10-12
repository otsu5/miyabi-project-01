/**
 * Check specific workflow run details
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkSpecificRun() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';
  const run_id = 18450020103;

  const octokit = new Octokit({ auth: token });

  console.log(`🔍 Checking workflow run: ${run_id}\n`);

  const { data: run } = await octokit.actions.getWorkflowRun({
    owner,
    repo,
    run_id
  });

  console.log('📋 Workflow Run Details:');
  console.log(`   Name: ${run.name}`);
  console.log(`   Status: ${run.status}`);
  console.log(`   Conclusion: ${run.conclusion}`);
  console.log(`   URL: ${run.html_url}\n`);

  const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
    owner,
    repo,
    run_id
  });

  console.log(`Jobs (${jobs.jobs.length}):\n`);

  for (const job of jobs.jobs) {
    const jobIcon = job.conclusion === 'success' ? '✅' :
                   job.conclusion === 'failure' ? '❌' : '⏳';

    console.log(`${jobIcon} ${job.name}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Conclusion: ${job.conclusion}`);

    if (job.steps) {
      console.log(`   Steps:`);
      job.steps.forEach(step => {
        const icon = step.conclusion === 'success' ? '✅' :
                    step.conclusion === 'failure' ? '❌' :
                    step.conclusion === 'skipped' ? '⏭️' : '⏳';
        console.log(`     ${icon} ${step.name} (${step.conclusion})`);
      });
    }
    console.log('');
  }
}

checkSpecificRun().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
