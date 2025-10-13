import express, { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Webhook secret loaded from environment variable
const SECRET = process.env.WEBHOOK_SECRET || '';

// Logs directory for JSONL format
const LOG_DIR = path.resolve(process.cwd(), '.webhook-logs');

function ensureDir(): Promise<void> {
  return fs.promises.mkdir(LOG_DIR, { recursive: true });
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function logEvent(entry: any): Promise<void> {
  try {
    await ensureDir();
    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const filePath = path.join(LOG_DIR, `${dateStr}.jsonl`);
    const line = JSON.stringify(entry) + '\n';
    await fs.promises.appendFile(filePath, line, 'utf8');
  } catch (err) {
    // Logging failure should not break the response flow
    console.error('Webhook logging failed:', err);
  }
}

// Middleware to capture raw body
function rawBodyMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      (req as any).rawBody = Buffer.concat(chunks);
      next();
    });
    req.on('error', (err) => {
      next(err);
    });
  };
}

export const webhookRouter = express.Router();

webhookRouter.post('/', rawBodyMiddleware(), async (req: Request, res: Response) => {
  const rawBody = (req as any).rawBody as Buffer;
  const signatureHeader = (req.headers['x-hub-signature-256'] || '') as string;
  const eventType = (req.headers['x-github-event'] || '') as string;

  if (!SECRET) {
    return res.status(401).json({ error: 'Webhook secret is not configured' });
  }

  if (!signatureHeader) {
    return res.status(401).json({ error: 'Missing signature header' });
  }

  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(rawBody);
  const digest = 'sha256=' + hmac.digest('hex');

  if (!safeCompare(digest, signatureHeader)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Parse payload
  let payload: any;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  const supported = new Set(['push', 'pull_request', 'issues', 'issue_comment']);
  const isSupported = supported.has(eventType);

  // Extract minimal info for internal processing
  let extracted: any = null;
  if (isSupported) {
    switch (eventType) {
      case 'push':
        extracted = {
          ref: payload.ref,
          repo: payload.repository?.full_name,
          pusher: payload.pusher?.name,
          commits: Array.isArray(payload.commits) ? payload.commits.length : 0,
        };
        break;
      case 'pull_request':
        extracted = {
          action: payload.action,
          pr_number: payload.number,
          title: payload.pull_request?.title,
          state: payload.pull_request?.state,
          merged: payload.pull_request?.merged,
        };
        break;
      case 'issues':
        extracted = {
          action: payload.action,
          issue_number: payload.issue?.number,
          title: payload.issue?.title,
        };
        break;
      case 'issue_comment':
        extracted = {
          action: payload.action,
          issue_number: payload.issue?.number,
          comment_preview: payload.comment?.body?.slice(0, 100),
        };
        break;
    }
  }

  // Logging (only when signature is valid)
  try {
    await logEvent({ timestamp: new Date().toISOString(), event: eventType, payload, extracted });
  } catch {
    // ignore logging errors
  }

  if (isSupported) {
    return res.status(200).json({ status: 'processed', event: eventType, timestamp: new Date().toISOString() });
  } else {
    // Unsupported event: respond 200 OK, but still log
    return res.status(200).json({ status: 'ignored', event: eventType, timestamp: new Date().toISOString() });
  }
});

export default webhookRouter;
