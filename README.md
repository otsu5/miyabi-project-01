# 🌸 Miyabi Project 01

Autonomous development powered by **Agentic OS** and **AI Agents**.

このプロジェクトは[Miyabiフレームワーク](https://github.com/ShunsukeHayashi/Autonomous-Operations)を使用した自律型開発システムです。GitHub IssueからコードとテストをAIが自動生成し、PRまで作成します。

## ✨ 主な機能

### 🤖 AI自律開発システム
- **GitHub Issue → コード自動生成**: Issue作成→AI分析→コード生成→テスト作成→PR作成まで全自動
- **コスト最適化AI Provider**: Gemini (無料) → GPT-5 nano ($0.0005/issue) → GPT-5 mini フォールバック
- **6つのAIエージェント**: Coordinator, CodeGen, Review, Issue, PR, Deploy

### 🌐 REST API
- **Express.js APIサーバー**: 多言語対応greet API、システム監視エンドポイント
- **CORS対応**: クロスオリジン対応
- **エラーハンドリング**: 適切な4xx/5xxエラーレスポンス

### 🧪 完全なテストカバレッジ
- **Vitest**: 12テスト全てパス
- **API統合テスト**: REST APIエンドポイントの完全なテスト

### 🔌 MCP統合
- **8つのMCPツール**: Claude Code内でMiyabi CLIを直接操作
- **GitHub統合**: Issue/PR管理、Actions連携

## 📦 インストール

```bash
# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env ファイルを編集: GITHUB_TOKEN, GEMINI_API_KEY, OPENAI_API_KEY
```

## 🚀 使い方

### APIサーバー起動

```bash
npm run api
```

エンドポイント:
- `GET /health` - ヘルスチェック
- `GET /api/greet` - 英語の挨拶 (デフォルト)
- `GET /api/greet/ja` - 日本語の挨拶
- `GET /api/greet/es` - スペイン語の挨拶
- `GET /api/status` - システム状態

### テスト実行

```bash
npm test           # 全テスト実行
npm run typecheck  # 型チェック
npm run lint       # リント
```

### AI Agent実行

```bash
# Issue #1を処理
npm run agents:parallel:exec -- --issue 1 --concurrency 3

# GitHubから直接トリガー
# Issue に 🤖agent-execute ラベルを追加
# または Issue コメントで /agent と入力
```

## 🏗️ プロジェクト構造

```
miyabi-project-01/
├── .claude/                 # Claude Code / MCP設定
│   ├── mcp.json            # MCPサーバー設定
│   └── mcp-servers/        # Miyabi統合MCPサーバー
├── .github/
│   └── workflows/          # 14+ GitHub Actions
│       └── autonomous-agent.yml  # AI Agent実行ワークフロー
├── src/
│   ├── api/
│   │   └── server.ts       # Express REST APIサーバー
│   ├── agents/
│   │   ├── ai-provider.ts  # コスト最適化AIプロバイダー
│   │   └── parallel-executor.ts  # Agent並列実行エンジン
│   ├── greet.ts            # 多言語挨拶関数
│   └── index.ts            # メインエントリーポイント
├── tests/
│   ├── api/
│   │   └── server.test.ts  # API統合テスト
│   ├── greet.test.ts       # greet関数テスト
│   └── index.test.ts       # メインテスト
└── scripts/                # 運用スクリプト
    ├── setup-secrets.ts    # GitHub Secrets自動設定
    ├── create-test-issue.ts
    ├── check-status.ts
    └── ...
```

## 🤖 自律開発ワークフロー

1. **GitHub Issueを作成**
   ```bash
   gh issue create \
     --title "新機能: ユーザー認証" \
     --body "JWT認証を実装" \
     --label "🤖agent-execute"
   ```

2. **AIが自動処理**
   - CoordinatorAgent: タスク分析・計画
   - CodeGenAgent: コード生成
   - ReviewAgent: 品質チェック
   - PRAgent: Pull Request作成

3. **レビュー・マージ**
   - Draft PRを確認
   - テスト結果確認
   - マージ

## 🔑 環境変数

```bash
# GitHub連携
GITHUB_TOKEN=ghp_xxxxx

# AI Provider
GEMINI_API_KEY=xxxxx        # Google Gemini (無料tier推奨)
OPENAI_API_KEY=sk-xxxxx     # OpenAI GPT-5 (フォールバック)
ANTHROPIC_API_KEY=sk-xxxxx  # Anthropic Claude (オプション)
```

## 💰 コスト管理

**推奨構成**: Gemini無料tier + GPT-5 nanoフォールバック
- Gemini 1.5 Flash: **無料** (1,500 req/day)
- GPT-5 nano: $0.0005/issue ($0.05/1M input, $0.40/1M output)
- GPT-5 mini: $0.0025/issue (フォールバック)

## 📊 GitHub Actions Workflows

| Workflow | トリガー | 説明 |
|----------|---------|------|
| Autonomous Agent Execution | Issue labeled / Comment /agent | AI Agent実行 |
| Webhook Event Handler | Push / PR / Issue | イベント処理 |
| State Machine Automation | Label changed | 状態遷移 |
| Economic Circuit Breaker | Scheduled | コスト制御 |

## 🧰 開発コマンド

```bash
npm run dev           # 開発サーバー起動
npm run api           # APIサーバー起動
npm run build         # TypeScriptビルド
npm test              # テスト実行
npm run lint          # リント実行
npm run typecheck     # 型チェック

# Agent実行
npm run agents:parallel:exec -- --issue <number>
npm run state:transition
npm run setup:secrets
```

## 📚 関連ドキュメント

- [Miyabi Framework](https://github.com/ShunsukeHayashi/Autonomous-Operations)
- [識学理論 (Shikigaku Theory)](https://www.shikigaku.jp/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Code](https://claude.com/claude-code)

## 🤝 コントリビューション

1. Issue作成 (バグ報告・機能要望)
2. Fork & Pull Request
3. AI Agentに処理させる (`🤖agent-execute` ラベル)

## 📝 ライセンス

MIT

---

🌸 **Miyabi** - Beauty in Autonomous Development

*Powered by Claude Code and Agentic OS*
