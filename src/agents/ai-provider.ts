/**
 * AI Provider Manager
 *
 * Cost-optimized fallback strategy:
 * 1. Gemini 1.5 Flash (free tier: 15 req/min, 1500 req/day)
 * 2. GPT-5 nano ($0.05/1M input, $0.40/1M output)
 * 3. GPT-5 mini ($0.25/1M input, $2.00/1M output)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

export interface AIResponse {
  content: string;
  provider: 'gemini' | 'gpt-5-nano' | 'gpt-5-mini';
  tokensUsed: { input: number; output: number };
  cost: number;
}

export class AIProviderManager {
  private gemini?: GoogleGenerativeAI;
  private openai?: OpenAI;
  private geminiRequestCount = 0;
  private geminiLastReset = Date.now();

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!geminiKey && !openaiKey) {
      throw new Error('At least one API key (GEMINI_API_KEY or OPENAI_API_KEY) is required');
    }

    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }

    if (openaiKey) {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
  }

  /**
   * Generate AI response with automatic fallback
   */
  async generate(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    // Try Gemini first (free tier)
    if (this.gemini && this.canUseGemini()) {
      try {
        return await this.generateWithGemini(prompt, systemPrompt);
      } catch (error) {
        console.warn('Gemini failed, falling back to GPT-5 nano:', error);
      }
    }

    // Fallback to GPT-5 nano
    if (this.openai) {
      try {
        return await this.generateWithGPT5Nano(prompt, systemPrompt);
      } catch (error) {
        console.warn('GPT-5 nano failed, falling back to GPT-5 mini:', error);
        return await this.generateWithGPT5Mini(prompt, systemPrompt);
      }
    }

    throw new Error('All AI providers failed');
  }

  private canUseGemini(): boolean {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    // Reset counter every 24 hours
    if (now - this.geminiLastReset > oneDay) {
      this.geminiRequestCount = 0;
      this.geminiLastReset = now;
    }

    // Free tier limit: 1500 requests per day
    return this.geminiRequestCount < 1500;
  }

  private async generateWithGemini(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.gemini) {
      throw new Error('Gemini client not initialized');
    }
    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const fullPrompt = systemPrompt
      ? `${systemPrompt}\n\n${prompt}`
      : prompt;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    this.geminiRequestCount++;

    return {
      content: text,
      provider: 'gemini',
      tokensUsed: {
        input: this.estimateTokens(fullPrompt),
        output: this.estimateTokens(text)
      },
      cost: 0 // Free tier
    };
  }

  private async generateWithGPT5Nano(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    const cost = usage
      ? (usage.prompt_tokens / 1_000_000) * 0.05 + (usage.completion_tokens / 1_000_000) * 0.40
      : 0;

    return {
      content,
      provider: 'gpt-5-nano',
      tokensUsed: {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0
      },
      cost
    };
  }

  private async generateWithGPT5Mini(prompt: string, systemPrompt?: string): Promise<AIResponse> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized');
    }
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: prompt });

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-5-mini',
      messages,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '';
    const usage = completion.usage;

    const cost = usage
      ? (usage.prompt_tokens / 1_000_000) * 0.25 + (usage.completion_tokens / 1_000_000) * 2.00
      : 0;

    return {
      content,
      provider: 'gpt-5-mini',
      tokensUsed: {
        input: usage?.prompt_tokens || 0,
        output: usage?.completion_tokens || 0
      },
      cost
    };
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      geminiRequestsToday: this.geminiRequestCount,
      geminiRemainingFree: Math.max(0, 1500 - this.geminiRequestCount),
      nextReset: new Date(this.geminiLastReset + 24 * 60 * 60 * 1000)
    };
  }
}
