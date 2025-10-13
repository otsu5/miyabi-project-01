/**
 * Grok Chatbot デモスクリプト
 *
 * 使い方:
 *   1. .envファイルにGROK_API_KEYを設定
 *   2. npm run build
 *   3. tsx examples/grok-chatbot-demo.ts
 */

import 'dotenv/config';
import { GrokClient } from '../src/grok-client.js';

async function main() {
  console.log('🤖 Grok Chatbot Demo\n');

  // Check API key
  if (!process.env.GROK_API_KEY || process.env.GROK_API_KEY === 'your_grok_api_key_here') {
    console.error('❌ GROK_API_KEY が設定されていません');
    console.log('\n.envファイルに実際のAPI keyを設定してください:');
    console.log('GROK_API_KEY=xai-xxxxx\n');
    console.log('API keyは https://console.x.ai から取得できます');
    process.exit(1);
  }

  try {
    const client = new GrokClient();

    console.log('✅ Grok クライアント初期化成功\n');
    console.log('📤 メッセージ送信中...\n');

    const response = await client.chat({
      messages: [
        {
          role: 'system',
          content: 'あなたは親切で知識豊富なAIアシスタントです。簡潔に回答してください。'
        },
        {
          role: 'user',
          content: 'こんにちは！あなたの名前は何ですか？'
        }
      ],
      temperature: 0.7,
      max_tokens: 100
    });

    console.log('📥 Grok からの応答:\n');
    console.log(`${response.choices[0].message.content}\n`);

    console.log('📊 使用統計:');
    console.log(`   モデル: ${response.model}`);
    console.log(`   入力トークン: ${response.usage.prompt_tokens}`);
    console.log(`   出力トークン: ${response.usage.completion_tokens}`);
    console.log(`   合計トークン: ${response.usage.total_tokens}`);

    console.log('\n✅ デモ完了！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);

    if (error instanceof Error) {
      if (error.message.includes('GROK_API_KEY')) {
        console.log('\n💡 GROK_API_KEYが見つかりません');
        console.log('   .envファイルを確認してください');
      } else if (error.message.includes('401')) {
        console.log('\n💡 API keyが無効です');
        console.log('   https://console.x.ai で確認してください');
      } else if (error.message.includes('rate limit')) {
        console.log('\n💡 レート制限に達しました');
        console.log('   少し待ってから再度お試しください');
      }
    }

    process.exit(1);
  }
}

main();
