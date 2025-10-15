import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getEnvConfig } from '@monorepo/shared';
import { bookmarkRouter } from './routes/bookmarks.js';
import { tagRouter } from './routes/tags.js';
import { categoryRouter } from './routes/categories.js';
import { noteRouter } from './routes/notes.js';

dotenv.config();

const app = express();
const config = getEnvConfig();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/bookmarks', bookmarkRouter);
app.use('/api/tags', tagRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/notes', noteRouter);

app.listen(config.API_PORT, () => {
  console.log(`Backend server running on ${config.API_BASE_URL}`);
  console.log(`Environment: ${config.NODE_ENV}`);
});
