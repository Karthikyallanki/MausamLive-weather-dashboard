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
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>MausamLive API Server</title></head>
      <body style="font-family: sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
        <h2>🌤️ MausamLive Backend API Server is Running!</h2>
        <p>The web interface frontend is hosted at <a href="http://localhost:3000" style="color: #38bdf8; font-weight: bold;">http://localhost:3000</a>.</p>
        <p>API Endpoint status: <a href="http://localhost:5000/api/health" style="color: #38bdf8;">/api/health</a></p>
      </body>
    </html>
  `);
});
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

