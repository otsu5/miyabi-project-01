import request from 'supertest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { app } from '../../src/api/server.js';

describe.skip('Webhook Handler Integration Tests', () => {
  const secret = 'testsecret';
  const logDir = path.resolve(process.cwd(), '.webhook-logs');

  beforeAll(() => {
    process.env.WEBHOOK_SECRET = secret;
    // Prepare log directory
    if (fs.existsSync(logDir)) {
      for (const f of fs.readdirSync(logDir)) {
        fs.unlinkSync(path.join(logDir, f));
      }
    } else {
      fs.mkdirSync(logDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up log directory after tests
    if (fs.existsSync(logDir)) {
      for (const f of fs.readdirSync(logDir)) {
        fs.unlinkSync(path.join(logDir, f));
      }
      fs.rmdirSync(logDir);
    }
  });

  const postWith = async (payload: any, event: string): Promise<request.Response> => {
    const raw = JSON.stringify(payload);
    const h = crypto.createHmac('sha256', secret);
    h.update(Buffer.from(raw, 'utf8'));
    const signature = 'sha256=' + h.digest('hex');
    return request(app)
      .post('/api/webhook/github')
      .set('X-GitHub-Event', event)
      .set('X-Hub-Signature-256', signature)
      .set('Content-Type', 'application/json')
      .send(raw);
  };

  test('valid signature processes push event and logs', async () => {
    const payload = {
      ref: 'refs/heads/main',
      repository: { full_name: 'owner/repo' },
      pusher: { name: 'alice' },
      commits: [{}, {}, {}]
    };

    const res = await postWith(payload, 'push');
    expect(res.status).toBe(200);
    expect(res.body?.status).toBe('processed');
    expect(res.body?.event).toBe('push');

    // Check that a log line has been written for today's date
    const dateStr = new Date().toISOString().slice(0, 10);
    const filePath = path.join(logDir, `${dateStr}.jsonl`);
    // Allow some time for async logging
    await new Promise(r => setTimeout(r, 100));
    expect(fs.existsSync(filePath)).toBe(true);
    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    expect(last.event).toBe('push');
  });

  test('invalid signature returns 401', async () => {
    const payload = { dummy: true };
    const raw = JSON.stringify(payload);
    const res = await request(app)
      .post('/api/webhook/github')
      .set('X-GitHub-Event', 'push')
      .set('X-Hub-Signature-256', 'sha256=invalidsignature')
      .set('Content-Type', 'application/json')
      .send(raw);
    expect(res.status).toBe(401);
  });

  test('invalid JSON payload returns 400', async () => {
    const raw = 'not-json';
    const h = crypto.createHmac('sha256', secret);
    h.update(Buffer.from(raw, 'utf8'));
    const signature = 'sha256=' + h.digest('hex');
    const res = await request(app)
      .post('/api/webhook/github')
      .set('X-GitHub-Event', 'push')
      .set('X-Hub-Signature-256', signature)
      .set('Content-Type', 'application/json')
      .send(raw);
    expect(res.status).toBe(400);
  });

  test('unsupported event returns 200 and logs', async () => {
    const payload = { any: 'data' };
    const raw = JSON.stringify(payload);
    const h = crypto.createHmac('sha256', secret);
    h.update(Buffer.from(raw, 'utf8'));
    const signature = 'sha256=' + h.digest('hex');
    const res = await request(app)
      .post('/api/webhook/github')
      .set('X-GitHub-Event', 'ping')
      .set('X-Hub-Signature-256', signature)
      .set('Content-Type', 'application/json')
      .send(raw);
    expect(res.status).toBe(200);
    expect(res.body?.status).toBe('ignored');

    // Log should exist for today's date with event 'ping'
    const dateStr = new Date().toISOString().slice(0, 10);
    const filePath = path.join(logDir, `${dateStr}.jsonl`);
    await new Promise(r => setTimeout(r, 100));
    expect(fs.existsSync(filePath)).toBe(true);
    const lines = fs.readFileSync(filePath, 'utf8').trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    expect(last.event).toBe('ping');
  });
});
