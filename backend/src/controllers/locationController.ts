import { Request, Response, NextFunction } from 'express';
import { OpenMeteoProvider } from '../providers/openMeteoProvider';

const provider = new OpenMeteoProvider();

export const searchLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter "q" must be at least 2 characters long.',
      });
    }

    const results = await provider.searchLocation(query.trim());
    return res.status(200).json({
      success: true,
      count: results.length,
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
