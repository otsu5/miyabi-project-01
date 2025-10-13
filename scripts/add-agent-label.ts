/**
 * Add agent-execute label to trigger AI Agent
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'otsu5';
const REPO = 'miyabi-project-01';
const ISSUE_NUMBER = 3;

async function addAgentLabel() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN not set in .env');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  try {
    await octokit.issues.addLabels({
      owner: OWNER,
      repo: REPO,
      issue_number: ISSUE_NUMBER,
      labels: ['🤖agent-execute']
    });

    console.log(`✅ Added 🤖agent-execute label to Issue #${ISSUE_NUMBER}`);
    console.log('');
    console.log('🤖 AI Agent will start processing in a few moments...');
    console.log(`   Monitor progress: https://github.com/${OWNER}/${REPO}/issues/${ISSUE_NUMBER}`);
    console.log(`   Workflow runs: https://github.com/${OWNER}/${REPO}/actions`);
  } catch (error: any) {
    console.error('❌ Error adding label:', error.message);
    process.exit(1);
  }
}

addAgentLabel();
