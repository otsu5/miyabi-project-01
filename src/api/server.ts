/**
 * REST API Server
 *
 * Provides HTTP endpoints for the Miyabi autonomous development system
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { greet } from '../greet.js';

const app = express();
const PORT = process.env.PORT || 3000;

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

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    availableRoutes: [
      'GET /health',
      'GET /api/greet/:lang',
      'GET /api/status'
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
  });
}

// Export app for testing
export { app };

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}
