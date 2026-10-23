import cors from 'cors';
import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';
import requirementsRouter from './routes/requirements.js';

export function createApp() {
  const app = express();

  // browsers send the origin without a trailing slash, so strip it from the config too
  const origins = process.env.CLIENT_ORIGIN?.split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  app.use(cors({ origin: origins?.length ? origins : '*' }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api/requirements', requirementsRouter);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use(errorHandler);

  return app;
}
