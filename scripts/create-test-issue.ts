/**
 * Create Test Issue
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

async function createTestIssue() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required');
  }

  const repository = 'otsu5/miyabi-project-01';
  const [owner, repo] = repository.split('/');

  console.log(`📝 Creating test issue in ${owner}/${repo}...`);

  const octokit = new Octokit({ auth: token });

  const { data: issue } = await octokit.issues.create({
    owner,
    repo,
    title: 'テスト: 多言語対応のgreet関数を作成',
    body: `## 要件

英語、日本語、スペイン語で挨拶を返す\`greet\`関数を作成してください。

## 仕様

\`\`\`typescript
function greet(language: 'en' | 'ja' | 'es'): string

// 使用例
greet('en') // => 'Hello, World!'
greet('ja') // => 'こんにちは、世界！'
greet('es') // => '¡Hola, Mundo!'
\`\`\`

## 実装場所

- ファイル: \`src/greet.ts\`
- テスト: \`tests/greet.test.ts\`

## テスト要件

- 3つの言語すべてをテスト
- デフォルト値のテスト（言語指定なし）
- TypeScript strict mode対応`,
    labels: ['🤖agent-execute', '✨ type:feature', '📊 priority:P2-Medium']
  });

  console.log(`✅ Issue created: #${issue.number}`);
  console.log(`🔗 URL: ${issue.html_url}`);
  console.log(`\n⏳ AI agents will start processing in a few moments...`);
  console.log(`📊 Monitor progress: https://github.com/${owner}/${repo}/actions`);
}

createTestIssue().catch((error) => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
