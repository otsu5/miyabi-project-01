import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLogs() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  // Get latest workflow run
  const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
    owner: 'otsu5',
    repo: 'miyabi-project-01',
    per_page: 1
  });

  if (runs.workflow_runs.length === 0) {
    console.log('No workflow runs found');
    return;
  }

  const run_id = runs.workflow_runs[0].id;
  console.log(`🔍 Checking latest workflow run: ${run_id}\n`);

  const { data: run } = await octokit.actions.getWorkflowRun({
    owner: 'otsu5',
    repo: 'miyabi-project-01',
    run_id
  });

  console.log('📋 Workflow Run Details:');
  console.log(`   Name: ${run.name}`);
  console.log(`   Status: ${run.status}`);
  console.log(`   Conclusion: ${run.conclusion}`);
  console.log(`   URL: ${run.html_url}\n`);

  const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
    owner: 'otsu5',
    repo: 'miyabi-project-01',
    run_id
  });

  console.log(`Jobs (${jobs.jobs.length}):\n`);
  jobs.jobs.forEach((job, i) => {
    console.log(`${i + 1}. ${job.name}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Conclusion: ${job.conclusion}`);
    if (job.steps) {
      console.log(`   Steps:`);
      job.steps.forEach(step => {
        const icon = step.conclusion === 'success' ? '✅' : step.conclusion === 'failure' ? '❌' : '⏭️';
        console.log(`     ${icon} ${step.name} (${step.conclusion})`);
      });
    }
    console.log('');
  });
}

checkLogs().catch(e => console.error('Error:', e.message));
