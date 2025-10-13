/**
 * Check Issue #3 status and workflow runs
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'otsu5';
const REPO = 'miyabi-project-01';
const ISSUE_NUMBER = 3;

async function checkStatus() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN not set in .env');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    // Check Issue status
    console.log('📋 Checking Issue #3 status...\n');
    const { data: issue } = await octokit.issues.get({
      owner: OWNER,
      repo: REPO,
      issue_number: ISSUE_NUMBER
    });

    console.log(`Issue #${issue.number}: ${issue.title}`);
    console.log(`State: ${issue.state}`);
    console.log(`Labels: ${issue.labels.map((l: any) => l.name).join(', ')}`);
    console.log(`URL: ${issue.html_url}`);
    console.log('');

    // Check workflow runs
    console.log('🔄 Recent workflow runs:\n');
    const { data: workflows } = await octokit.actions.listWorkflowRunsForRepo({
      owner: OWNER,
      repo: REPO,
      per_page: 5
    });

    workflows.workflow_runs.forEach((run: any) => {
      const statusEmoji = run.status === 'completed'
        ? (run.conclusion === 'success' ? '✅' : '❌')
        : '🔄';
      console.log(`${statusEmoji} ${run.name}`);
      console.log(`   Status: ${run.status} / ${run.conclusion || 'in_progress'}`);
      console.log(`   Started: ${new Date(run.created_at).toLocaleString()}`);
      console.log(`   URL: ${run.html_url}`);
      console.log('');
    });

    // Check for PRs
    console.log('🔀 Pull Requests:\n');
    const { data: prs } = await octokit.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: 'open',
      per_page: 5
    });

    if (prs.length === 0) {
      console.log('   No open PRs yet. AI Agent may still be processing...');
    } else {
      prs.forEach((pr: any) => {
        console.log(`PR #${pr.number}: ${pr.title}`);
        console.log(`   State: ${pr.state} (draft: ${pr.draft})`);
        console.log(`   Branch: ${pr.head.ref} → ${pr.base.ref}`);
        console.log(`   URL: ${pr.html_url}`);
        console.log('');
      });
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStatus();
