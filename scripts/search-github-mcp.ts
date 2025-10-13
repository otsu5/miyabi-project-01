/**
 * Search for MCP servers in user's GitHub repositories
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function searchGitHubMCP() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const octokit = new Octokit({ auth: token });

  console.log('🔍 Searching for MCP servers in your GitHub repositories...\n');

  // Get authenticated user
  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`User: ${user.login}\n`);

  // Search for repositories with 'mcp' in name or description
  const { data: searchResult } = await octokit.search.repos({
    q: `user:${user.login} mcp`,
    sort: 'updated',
    per_page: 10
  });

  console.log(`Found ${searchResult.total_count} repositories with "mcp":\n`);

  for (const repo of searchResult.items) {
    console.log(`📦 ${repo.name}`);
    console.log(`   Description: ${repo.description || 'No description'}`);
    console.log(`   URL: ${repo.html_url}`);
    console.log(`   Updated: ${new Date(repo.updated_at).toLocaleDateString('ja-JP')}`);

    // Check if it has mcp.json or package.json with mcp keywords
    try {
      const { data: contents } = await octokit.repos.getContent({
        owner: user.login,
        repo: repo.name,
        path: ''
      });

      if (Array.isArray(contents)) {
        const mcpFiles = contents.filter(file =>
          file.name.includes('mcp') ||
          file.name === 'package.json'
        );

        if (mcpFiles.length > 0) {
          console.log(`   MCP files: ${mcpFiles.map(f => f.name).join(', ')}`);
        }
      }
    } catch (error) {
      // Repository might be empty or inaccessible
    }

    console.log('');
  }

  // Also search in starred repositories
  console.log('\n⭐ Checking starred repositories with MCP...\n');

  const { data: starred } = await octokit.activity.listReposStarredByAuthenticatedUser({
    per_page: 100
  });

  const mcpStarred = starred.filter(repo =>
    repo.name.toLowerCase().includes('mcp') ||
    repo.description?.toLowerCase().includes('model context protocol')
  );

  console.log(`Found ${mcpStarred.length} starred MCP repositories:\n`);

  for (const repo of mcpStarred.slice(0, 10)) {
    console.log(`⭐ ${repo.full_name}`);
    console.log(`   ${repo.description || 'No description'}`);
    console.log(`   ${repo.html_url}\n`);
  }
}

searchGitHubMCP().catch((error) => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
