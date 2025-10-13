import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '../../src/api/server.js';
import type { Server } from 'http';

let server: Server;
const BASE_URL = 'http://localhost:3001';

beforeAll(() => {
  return new Promise<void>((resolve) => {
    server = app.listen(3001, () => {
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
});

describe('API Server', () => {
  describe('GET /health', () => {
    it('returns health status', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('status', 'healthy');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('version');
    });
  });

  describe('GET /api/greet/:lang', () => {
    it('returns English greeting by default', async () => {
      const response = await fetch(`${BASE_URL}/api/greet`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language).toBe('en');
      expect(data.message).toBe('Hello, World!');
      expect(data).toHaveProperty('timestamp');
    });

    it('returns Japanese greeting', async () => {
      const response = await fetch(`${BASE_URL}/api/greet/ja`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language).toBe('ja');
      expect(data.message).toBe('こんにちは、世界！');
    });

    it('returns Spanish greeting', async () => {
      const response = await fetch(`${BASE_URL}/api/greet/es`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.language).toBe('es');
      expect(data.message).toBe('¡Hola, Mundo!');
    });

    it('returns 400 for invalid language', async () => {
      const response = await fetch(`${BASE_URL}/api/greet/fr`);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid language');
      expect(data.supported).toEqual(['en', 'ja', 'es']);
    });
  });

  describe('GET /api/status', () => {
    it('returns system status', async () => {
      const response = await fetch(`${BASE_URL}/api/status`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.system).toBe('Miyabi Autonomous Development');
      expect(data.status).toBe('operational');
      expect(data).toHaveProperty('agents');
      expect(data).toHaveProperty('uptime');
      expect(data).toHaveProperty('memory');
    });
  });

  describe('404 handler', () => {
    it('returns 404 for unknown routes', async () => {
      const response = await fetch(`${BASE_URL}/unknown`);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toHaveProperty('error', 'Not Found');
      expect(data).toHaveProperty('availableRoutes');
    });
  });
});
