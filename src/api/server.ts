/**
 * REST API Server
 *
 * Provides HTTP endpoints for the Miyabi autonomous development system
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { greet } from '../greet.js';
import { CostTracker } from '../monitoring/cost-tracker.js';
import webhookRouter from './webhook-handler.js';
import chatbotRouter from './chatbot.js';

const app = express();
const PORT = process.env.PORT || 3000;
const costTracker = new CostTracker();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0'
  });
});

// Greet endpoint - multi-language greeting (default)
app.get('/api/greet', (req: Request, res: Response) => {
  const message = greet();

  res.json({
    language: 'en',
    message,
    timestamp: new Date().toISOString()
  });
});

// Greet endpoint - with language parameter
app.get('/api/greet/:lang', (req: Request, res: Response) => {
  const lang = req.params.lang as 'en' | 'ja' | 'es';

  // Validate language parameter
  if (!['en', 'ja', 'es'].includes(lang)) {
    return res.status(400).json({
      error: 'Invalid language',
      message: 'Supported languages: en, ja, es',
      supported: ['en', 'ja', 'es']
    });
  }

  const message = greet(lang);

  res.json({
    language: lang,
    message,
    timestamp: new Date().toISOString()
  });
});

// System status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    system: 'Miyabi Autonomous Development',
    status: 'operational',
    agents: {
      coordinator: 'ready',
      codegen: 'ready',
      review: 'ready',
      test: 'ready'
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Cost monitoring endpoints
app.get('/api/cost/daily', (req: Request, res: Response) => {
  const summary = costTracker.calculateDailySummary();
  const geminiLimit = costTracker.checkGeminiLimit();

  res.json({
    summary,
    geminiLimit,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cost/monthly', (req: Request, res: Response) => {
  const summary = costTracker.calculateMonthlySummary();

  res.json({
    summary,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/cost/report', (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const report = costTracker.generateReport(days);

  res.json(report);
});

app.get('/api/cost/usage', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const usage = costTracker.getRecentUsage(limit);

  res.json({
    usage,
    count: usage.length,
    timestamp: new Date().toISOString()
  });
});

// GitHub Webhook endpoint
app.use('/api/webhook/github', webhookRouter);

// Mount chatbot router
app.use('/api/chatbot', chatbotRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/greet/:lang',
      'GET /api/status',
      'GET /api/cost/daily',
      'GET /api/cost/monthly',
      'GET /api/cost/report?days=7',
      'GET /api/cost/usage',
      'POST /api/webhook/github',
      'POST /api/chatbot',
      'GET /api/chatbot/health'
    ]
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
export function startServer() {
  return app.listen(PORT, () => {
    console.log(`🌸 Miyabi API Server`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/health`);
    console.log(`   Greet: http://localhost:${PORT}/api/greet/:lang`);
    console.log(`   Status: http://localhost:${PORT}/api/status`);
    console.log(`   Chatbot: http://localhost:${PORT}/api/chatbot`);
  });
}

// Export app for testing
export { app };

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
