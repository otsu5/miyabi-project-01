# Webhook Receiver (GitHub)

This project implements a GitHub webhook receiver using Express. It validates signatures using a secret provided via the WEBHOOK_SECRET environment variable, logs every valid event to JSONL files under .webhook-logs/, and supports four GitHub events: push, pull_request, issues, and issue_comment.

Usage:

- Set the secret:
  - Linux/Mac: export WEBHOOK_SECRET=your_secret
  - Windows (PowerShell): $env:WEBHOOK_SECRET = 'your_secret'

- Start the server (example):
  - You can import the Express app from src/api/server.ts and start it as you would with any Express app.

Endpoint:
- POST /api/webhook/github
  - Reads the raw body for signature verification
  - Requires header X-Hub-Signature-256 and X-GitHub-Event
  - If the event is one of push, pull_request, issues, issue_comment, it processes and responds with { status: 'processed', event: '<type>', timestamp: '...' }
  - If the event is not supported, responds with { status: 'ignored', event: '<type>', timestamp: '...' }
  - On invalid signature: 401 Unauthorized
  - On invalid JSON: 400 Bad Request

Logging:
- All valid webhook events are logged in JSON Lines format under .webhook-logs/ in files named by date: YYYY-MM-DD.jsonl
- Each line is a JSON object with fields like timestamp, event, payload, extracted (optional).

Tests:
- Jest tests are included to verify signature verification, processing of each event type, and invalid payload handling.

Files touched:
- src/api/server.ts: server integration point
- src/api/webhook-handler.ts: main webhook logic
- tests/api/webhook-handler.test.ts: Jest tests

