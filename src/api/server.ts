import express from 'express';
import webhookRouter from './webhook-handler';

// Expose the app so tests can import and run without a real server
export const app = express();

// Mount the webhook router at the expected path
app.use('/api/webhook/github', webhookRouter);

export default app;
