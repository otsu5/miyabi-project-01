/**
 * Create GitHub Webhook Feature Issue
 *
 * Creates an Issue for AI Agent to implement GitHub Webhook endpoint
 */

import { Octokit } from '@octokit/rest';
import * as dotenv from 'dotenv';

dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'otsu5';
const REPO = 'miyabi-project-01';

async function createWebhookIssue() {
  if (!GITHUB_TOKEN) {
    console.error('❌ Error: GITHUB_TOKEN not set in .env');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const issueBody = `## 概要

GitHub WebhookイベントをAPIサーバーで受信し、イベントタイプごとに適切な処理を行うエンドポイントを実装する。

## 要件

### 1. エンドポイント実装
- \`POST /api/webhook/github\` エンドポイントを作成
- HMAC-SHA256署名検証（セキュリティ）
- イベントタイプの識別（X-GitHub-Event ヘッダー）

### 2. サポートするイベント
- \`push\` - プッシュイベント（ブランチ、コミット情報）
- \`pull_request\` - PRイベント（open, close, merge）
- \`issues\` - Issueイベント（open, close, labeled）
- \`issue_comment\` - コメントイベント

### 3. レスポンス
- 成功時: \`{ "status": "processed", "event": "push", "timestamp": "..." }\`
- 署名エラー: 401 Unauthorized
- 未サポートイベント: 200 OK（ログに記録）

### 4. ロギング
- 全Webhookイベントをログに記録
- \`.webhook-logs/\` ディレクトリにJSONL形式で保存

## 技術スタック
- Express.js（既存APIサーバー拡張）
- crypto（署名検証用）
- fs（ログ保存）

## テスト要件
- 署名検証のテスト
- 各イベントタイプの処理テスト
- 不正なペイロードの処理テスト

## 参考
- [GitHub Webhook Documentation](https://docs.github.com/en/webhooks)
- 既存のAPIサーバー: \`src/api/server.ts\`

## 期待される成果物
1. \`src/api/webhook-handler.ts\` - Webhook処理ロジック
2. \`tests/api/webhook-handler.test.ts\` - テストコード
3. \`src/api/server.ts\` への統合
4. READMEの更新`;

  try {
    const { data: issue } = await octokit.issues.create({
      owner: OWNER,
      repo: REPO,
      title: 'feat: GitHub Webhook受信エンドポイントの実装',
      body: issueBody,
      labels: ['type:feature', 'priority:P2-Medium', 'complexity:medium']
    });

    console.log('✅ Issue created successfully!');
    console.log(`   Issue #${issue.number}`);
    console.log(`   URL: ${issue.html_url}`);
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Add 🤖agent-execute label to trigger AI Agent');
    console.log('   2. Or comment "/agent" on the Issue');
    console.log('');
    console.log('⏳ The AI Agent will:');
    console.log('   - Analyze the requirements');
    console.log('   - Generate webhook-handler.ts');
    console.log('   - Create comprehensive tests');
    console.log('   - Integrate with existing API server');
    console.log('   - Submit a Pull Request');

    return issue;
  } catch (error: any) {
    console.error('❌ Error creating Issue:', error.message);
    if (error.status === 401) {
      console.error('   → Check your GITHUB_TOKEN permissions');
    }
    process.exit(1);
  }
}

createWebhookIssue();
