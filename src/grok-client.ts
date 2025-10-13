import OpenAI from 'openai';

export interface GrokChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GrokChatRequest {
  messages: GrokChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface GrokChatResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GrokClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GROK_API_KEY;
    if (!key) {
      throw new Error('GROK_API_KEY not found in environment or constructor');
    }

    // Grok API is OpenAI-compatible, just change the base URL
    this.client = new OpenAI({
      apiKey: key,
      baseURL: 'https://api.x.ai/v1',
    });
  }

  async chat(request: GrokChatRequest): Promise<GrokChatResponse> {
    const response = await this.client.chat.completions.create({
      model: request.model || 'grok-beta',
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: false,
    });

    return response as GrokChatResponse;
  }

  async chatStream(
    request: GrokChatRequest,
    onChunk: (content: string) => void
  ): Promise<void> {
    const stream = await this.client.chat.completions.create({
      model: request.model || 'grok-beta',
      messages: request.messages,
      temperature: request.temperature,
      max_tokens: request.max_tokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  }
}
