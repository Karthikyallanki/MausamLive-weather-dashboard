import { Router, Request, Response } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    app: 'MausamLive Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    weatherProvider: process.env.WEATHER_PROVIDER || 'open-meteo',
  });
});

export default router;
