# Grok チャットボット API

Grok APIを使用したチャットボット機能の実装ドキュメント

## 概要

このプロジェクトは、xAI社のGrok APIを使用したチャットボット機能を提供します。Grok APIはOpenAI SDK互換なので、既存のOpenAIクライアントコードを簡単に移行できます。

## 機能

- **Grok API統合**: OpenAI互換のAPIクライアント
- **会話履歴サポート**: 複数ターンの会話に対応
- **カスタマイズ可能**: モデル、温度、最大トークン数を指定可能
- **ヘルスチェック**: API設定状態の確認

## セットアップ

### 1. Grok API キーの取得

1. [console.x.ai](https://console.x.ai)にアクセス
2. アカウントを作成/ログイン
3. API Keysページで新しいAPIキーを作成

### 2. 環境変数の設定

`.env`ファイルにGrok API keyを追加:

```bash
GROK_API_KEY=your_grok_api_key_here
```

## API エンドポイント

### POST /api/chatbot

Grokとチャット対話を行います。

**リクエスト**:

```json
{
  "message": "こんにちは、Grokさん！",
  "history": [
    {
      "role": "user",
      "content": "前の質問"
    },
    {
      "role": "assistant",
      "content": "前の回答"
    }
  ],
  "model": "grok-beta",
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**パラメータ**:

- `message` (必須): ユーザーのメッセージ
- `history` (オプション): 会話履歴の配列
- `model` (オプション): 使用するモデル (デフォルト: "grok-beta")
- `temperature` (オプション): 生成の温度 (0.0-2.0)
- `max_tokens` (オプション): 最大トークン数

**レスポンス**:

```json
{
  "response": "こんにちは！何かお手伝いできることはありますか？",
  "model": "grok-beta",
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

**エラーレスポンス**:

- `400 Bad Request`: messageが空または無効
- `500 Internal Server Error`: API keyが設定されていない、またはGrok APIエラー

### GET /api/chatbot/health

チャットボットサービスの状態確認

**レスポンス**:

```json
{
  "status": "ok",
  "service": "grok-chatbot",
  "apiKeyConfigured": true,
  "timestamp": "2025-10-13T12:00:00.000Z"
}
```

## 使用例

### cURL

```bash
# ヘルスチェック
curl http://localhost:3000/api/chatbot/health

# シンプルなメッセージ
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "TypeScriptとは何ですか？"}'

# 会話履歴付き
curl -X POST http://localhost:3000/api/chatbot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "それについてもっと詳しく教えて",
    "history": [
      {"role": "user", "content": "TypeScriptとは何ですか？"},
      {"role": "assistant", "content": "TypeScriptはJavaScriptのスーパーセットです..."}
    ]
  }'
```

### JavaScript/TypeScript

```typescript
// GrokClientを直接使用
import { GrokClient } from './src/grok-client';

const client = new GrokClient();

const response = await client.chat({
  messages: [
    { role: 'system', content: 'あなたは親切なAIアシスタントです。' },
    { role: 'user', content: 'こんにちは！' }
  ],
  temperature: 0.7,
  max_tokens: 500
});

console.log(response.choices[0].message.content);

// HTTPエンドポイント経由
const response = await fetch('http://localhost:3000/api/chatbot', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Grokの特徴を教えてください',
    temperature: 0.8
  })
});

const data = await response.json();
console.log(data.response);
```

### Python

```python
import requests

# ヘルスチェック
health = requests.get('http://localhost:3000/api/chatbot/health')
print(health.json())

# チャット
response = requests.post(
    'http://localhost:3000/api/chatbot',
    json={
        'message': 'AIについて教えてください',
        'temperature': 0.7,
        'max_tokens': 500
    }
)

data = response.json()
print(data['response'])
```

## 実装詳細

### ファイル構成

```
src/
├── grok-client.ts        # Grok APIクライアント (OpenAI SDK使用)
└── api/
    ├── chatbot.ts        # チャットボットAPIルーター
    └── server.ts         # Expressサーバー (chatbot統合済み)

tests/
├── grok-client.test.ts   # クライアントユニットテスト
└── api/
    └── chatbot.test.ts   # APIエンドポイント統合テスト
```

### GrokClient クラス

OpenAI SDKをラップした、Grok API専用クライアント:

```typescript
const client = new GrokClient(apiKey); // または環境変数から自動取得

// 通常のチャット
const response = await client.chat({
  messages: [...],
  model: 'grok-beta',
  temperature: 0.7
});

// ストリーミング
await client.chatStream(
  { messages: [...] },
  (chunk) => {
    process.stdout.write(chunk);
  }
);
```

## テスト

```bash
# 全テスト実行
npm test

# チャットボット関連のみ
npm test -- tests/api/chatbot.test.ts tests/grok-client.test.ts
```

**テストカバレッジ**:
- ✅ GrokClient初期化テスト (3テスト)
- ✅ チャットボットAPIエンドポイントテスト (7テスト)

## Grok API について

### モデル

- **grok-beta**: 標準モデル (推奨)
- **grok-4**: 最新の高性能モデル (利用可能な場合)

### 料金

詳細は[xAI Pricing](https://x.ai/api#pricing)を参照してください。

### レート制限

APIリクエストにはレート制限があります。詳細は[xAI Documentation](https://docs.x.ai/docs)を参照。

## トラブルシューティング

### API Key エラー

```
GROK_API_KEY not found in environment or constructor
```

→ `.env`ファイルに`GROK_API_KEY`が設定されているか確認してください。

### 接続エラー

```
Failed to connect to api.x.ai
```

→ インターネット接続を確認してください。プロキシ環境の場合は、適切な設定が必要です。

### レート制限エラー

```
Rate limit exceeded
```

→ リクエスト頻度を下げるか、アカウントのプランをアップグレードしてください。

## 参考リンク

- [xAI Official Documentation](https://docs.x.ai/)
- [xAI API Console](https://console.x.ai/)
- [Grok Models](https://docs.x.ai/docs/models)
- [OpenAI SDK](https://github.com/openai/openai-node) (互換性あり)

## ライセンス

MIT
