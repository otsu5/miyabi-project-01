import express, { Request, Response } from 'express';
import { GrokClient } from '../grok-client';

const router = express.Router();

// JSON body parser for this route
router.use(express.json());

interface ChatRequest {
  message: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface ChatResponse {
  response: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// POST /api/chatbot - チャットボットとの対話
router.post('/', async (req: Request, res: Response) => {
  try {
    const { message, history = [], model, temperature, max_tokens }: ChatRequest = req.body;

    // Validation
    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
        error: 'Invalid request',
        message: 'message field is required and must be a non-empty string',
      });
      return;
    }

    // Initialize Grok client
    const grokClient = new GrokClient();

    // Build messages array
    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful AI assistant powered by Grok.',
      },
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: message,
      },
    ];

    // Call Grok API
    const response = await grokClient.chat({
      messages,
      model,
      temperature,
      max_tokens,
    });

    const chatResponse: ChatResponse = {
      response: response.choices[0].message.content,
      model: response.model,
      usage: response.usage,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error('Chatbot error:', error);

    // Handle missing API key
    if (error instanceof Error && error.message.includes('GROK_API_KEY')) {
      res.status(500).json({
        error: 'Configuration error',
        message: 'GROK_API_KEY is not configured',
      });
      return;
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
});

// GET /api/chatbot/health - ヘルスチェック
router.get('/health', (req: Request, res: Response) => {
  const hasApiKey = !!process.env.GROK_API_KEY;

  res.json({
    status: 'ok',
    service: 'grok-chatbot',
    apiKeyConfigured: hasApiKey,
    timestamp: new Date().toISOString(),
  });
});

export default router;
