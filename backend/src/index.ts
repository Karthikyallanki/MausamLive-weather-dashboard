import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import apiRouter from './routes/api';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { initAlertCron } from './notifications/alertCron';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', healthRouter);
app.use('/api', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

// Start Alert Scheduler Cron
initAlertCron();

// Start Server
app.listen(PORT, () => {
  logger.info(`🌤️ MausamLive Backend Server running on http://localhost:${PORT}`);
});

