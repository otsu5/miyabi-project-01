/**
 * Check Status
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkStatus() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const owner = 'otsu5';
  const repo = 'miyabi-project-01';

  const octokit = new Octokit({ auth: token });

  console.log('📊 Checking workflow status...\n');

  // Check workflow runs
  const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    per_page: 10
  });

  if (runs.workflow_runs.length === 0) {
    console.log('⚠️  No workflow runs found yet.');
    console.log('\nPossible reasons:');
    console.log('1. Workflows may take 10-30 seconds to start');
    console.log('2. Check if workflows are enabled in repository settings');
    console.log('3. Verify .github/workflows files exist');
  } else {
    console.log('Recent Workflow Runs:');
    runs.workflow_runs.slice(0, 5).forEach((run, i) => {
      const statusIcon = run.status === 'completed'
        ? (run.conclusion === 'success' ? '✅' : '❌')
        : run.status === 'in_progress' ? '⏳' : '🔵';

      console.log(`\n${i + 1}. ${statusIcon} ${run.name}`);
      console.log(`   Status: ${run.status}`);
      if (run.conclusion) {
        console.log(`   Conclusion: ${run.conclusion}`);
      }
      console.log(`   Created: ${new Date(run.created_at).toLocaleString('ja-JP')}`);
      console.log(`   🔗 ${run.html_url}`);
    });
  }

  // Check Issue #1
  console.log('\n\n📝 Issue #1 Status:');
  try {
    const { data: issue } = await octokit.issues.get({
      owner,
      repo,
      issue_number: 1
    });

    console.log(`   State: ${issue.state}`);
    console.log(`   Labels: ${issue.labels.map((l: any) => l.name).join(', ')}`);
    console.log(`   Comments: ${issue.comments}`);
    console.log(`   🔗 ${issue.html_url}`);
  } catch (error) {
    console.log('   ⚠️  Issue not found or not accessible');
  }

  console.log('\n\n💡 Quick Links:');
  console.log(`   Actions: https://github.com/${owner}/${repo}/actions`);
  console.log(`   Issues: https://github.com/${owner}/${repo}/issues`);
  console.log(`   Pull Requests: https://github.com/${owner}/${repo}/pulls`);
}

checkStatus().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
