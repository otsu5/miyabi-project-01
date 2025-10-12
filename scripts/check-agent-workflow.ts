/**
 * Check Autonomous Agent workflow status
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkAgentWorkflow() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';

  const octokit = new Octokit({ auth: token });

  console.log('🔍 Checking Autonomous Agent workflow runs...\n');

  // Get all workflow runs
  const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    per_page: 20
  });

  // Filter for Autonomous Agent workflow
  const agentRuns = runs.workflow_runs.filter(run =>
    run.name === 'Autonomous Agent Execution' ||
    run.name === '🤖 Autonomous Agent Execution'
  );

  if (agentRuns.length === 0) {
    console.log('⚠️  No Autonomous Agent workflow runs found.');
    console.log('\nAll recent workflows:');
    runs.workflow_runs.slice(0, 10).forEach((run, i) => {
      console.log(`${i + 1}. ${run.name} - ${run.status} (${run.conclusion || 'in_progress'})`);
    });
    return;
  }

  console.log(`Found ${agentRuns.length} Autonomous Agent workflow run(s):\n`);

  for (const run of agentRuns.slice(0, 3)) {
    const statusIcon = run.status === 'completed'
      ? (run.conclusion === 'success' ? '✅' : '❌')
      : '⏳';

    console.log(`${statusIcon} Run #${run.run_number}`);
    console.log(`   Status: ${run.status}`);
    if (run.conclusion) {
      console.log(`   Conclusion: ${run.conclusion}`);
    }
    console.log(`   Created: ${new Date(run.created_at).toLocaleString('ja-JP')}`);
    console.log(`   🔗 ${run.html_url}`);

    // Get jobs for this run
    const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: run.id
    });

    if (jobs.jobs.length > 0) {
      console.log(`   Jobs:`);
      jobs.jobs.forEach(job => {
        const jobIcon = job.conclusion === 'success' ? '✅' :
                       job.conclusion === 'failure' ? '❌' : '⏳';
        console.log(`     ${jobIcon} ${job.name} (${job.conclusion || job.status})`);

        if (job.steps && job.conclusion === 'failure') {
          const failedSteps = job.steps.filter(step => step.conclusion === 'failure');
          if (failedSteps.length > 0) {
            console.log(`       Failed steps:`);
            failedSteps.forEach(step => {
              console.log(`         ❌ ${step.name}`);
            });
          }
        }
      });
    }
    console.log('');
  }
}

checkAgentWorkflow().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
