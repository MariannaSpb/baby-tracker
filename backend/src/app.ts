import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import './config/firebase'; // Initialize Firebase Admin SDK
import { eventsRouter } from './routes/events.routes';
import { errorMiddleware } from './middleware/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Health check — used by Cloud Run to verify the container is alive
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/events', eventsRouter);

// Centralized error handler — must be last
app.use(errorMiddleware);

export { app };
