import { Request, Response, NextFunction } from 'express';
import { OpenMeteoProvider } from '../providers/openMeteoProvider';
import { CacheService } from '../services/cacheService';

const provider = new OpenMeteoProvider();

export const getWeather = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const latStr = req.query.lat as string;
    const lonStr = req.query.lon as string;
    const name = (req.query.name as string) || 'Selected Location';

    if (!latStr || !lonStr) {
      return res.status(400).json({
        success: false,
        message: 'Latitude (lat) and Longitude (lon) parameters are required.',
      });
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and Longitude must be valid numbers.',
      });
    }

    // Round coordinates to 3 decimals for cache key consistency
    const cacheKey = `weather_${lat.toFixed(3)}_${lon.toFixed(3)}_${name}`;
    const cachedData = await CacheService.getCachedWeather(cacheKey);

    if (cachedData) {
      return res.status(200).json({
        success: true,
        source: 'cache',
        data: cachedData,
      });
    }

    const weatherData = await provider.getWeatherByCoords(lat, lon, name);
    await CacheService.setCachedWeather(cacheKey, weatherData);

    return res.status(200).json({
      success: true,
      source: 'live',
      data: weatherData,
    });
  } catch (error) {
    next(error);
  }
};
