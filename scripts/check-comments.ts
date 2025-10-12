import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkComments() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const { data: comments } = await octokit.issues.listComments({
    owner: 'otsu5',
    repo: 'miyabi-project-01',
    issue_number: 1
  });

  console.log('💬 Issue #1 Comments:\n');
  comments.forEach((comment, i) => {
    console.log(`${i + 1}. By: ${comment.user?.login}`);
    console.log(`   Date: ${new Date(comment.created_at).toLocaleString('ja-JP')}`);
    console.log(`   Body:\n${comment.body}\n`);
    console.log('---\n');
  });
}

checkComments().catch(e => console.error('Error:', e.message));
