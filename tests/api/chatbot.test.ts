import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import chatbotRouter from '../../src/api/chatbot';

// Create test app
const app = express();
app.use('/api/chatbot', chatbotRouter);

describe('Chatbot API', () => {
  beforeEach(() => {
    vi.stubEnv('GROK_API_KEY', 'test-api-key');
  });

  describe('GET /api/chatbot/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/chatbot/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('service', 'grok-chatbot');
      expect(response.body).toHaveProperty('apiKeyConfigured');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should indicate if API key is configured', async () => {
      const response = await request(app).get('/api/chatbot/health');

      expect(response.body.apiKeyConfigured).toBe(true);
    });

    it('should indicate if API key is not configured', async () => {
      vi.unstubAllEnvs();
      const response = await request(app).get('/api/chatbot/health');

      expect(response.body.apiKeyConfigured).toBe(false);
    });
  });

  describe('POST /api/chatbot', () => {
    it('should return 400 if message is missing', async () => {
      const response = await request(app).post('/api/chatbot').send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request');
    });

    it('should return 400 if message is empty string', async () => {
      const response = await request(app).post('/api/chatbot').send({
        message: '   ',
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request');
    });

    it('should return 400 if message is not a string', async () => {
      const response = await request(app).post('/api/chatbot').send({
        message: 123,
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'Invalid request');
    });

    it('should return 500 if GROK_API_KEY is not configured', async () => {
      vi.unstubAllEnvs();
      const response = await request(app).post('/api/chatbot').send({
        message: 'Hello',
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Configuration error');
      expect(response.body.message).toContain('GROK_API_KEY');
    });
  });
});
