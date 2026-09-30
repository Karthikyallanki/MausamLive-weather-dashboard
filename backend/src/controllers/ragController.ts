import { Request, Response } from 'express';
import { RagService } from '../services/ragService';
import { logger } from '../utils/logger';

export const handleRagQuery = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, location, liveWeather } = req.body;
    if (!query) {
      res.status(400).json({ error: 'Query parameter is required' });
      return;
    }

    const result = await RagService.queryRag(query, location, liveWeather);
    res.json(result);
  } catch (error: any) {
    logger.error(`RAG Controller query error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process RAG query' });
  }
};

export const handleRagExplain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { metric, value, query } = req.body;
    const result = await RagService.explainMetric(metric, value, query);
    res.json(result);
  } catch (error: any) {
    logger.error(`RAG Controller explain error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process RAG metric explanation' });
  }
};

export const handleRagAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { location, liveWeather, question } = req.body;
    const result = await RagService.getAdvice(location, liveWeather, question);
    res.json(result);
  } catch (error: any) {
    logger.error(`RAG Controller advice error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process weather advice' });
  }
};

export const handleRagAlertExplanation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { alertType, location, liveWeather } = req.body;
    const result = await RagService.explainAlert(alertType, location, liveWeather);
    res.json(result);
  } catch (error: any) {
    logger.error(`RAG Controller alert error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process alert explanation' });
  }
};

export const handleRagTravelAdvice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { destination, liveWeather, question } = req.body;
    const result = await RagService.getTravelAdvice(destination, liveWeather, question);
    res.json(result);
  } catch (error: any) {
    logger.error(`RAG Controller travel error: ${error.message}`);
    res.status(500).json({ error: 'Failed to process travel advice' });
  }
};
