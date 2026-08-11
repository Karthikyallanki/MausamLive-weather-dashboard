import prisma from '../database/db';
import { FullWeatherData } from '../providers/weatherProvider.interface';
import { logger } from '../utils/logger';

// Memory cache fallback for fast response
const memoryCache = new Map<string, { data: FullWeatherData; expiresAt: number }>();

export class CacheService {
  private static CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

  static async getCachedWeather(cacheKey: string): Promise<FullWeatherData | null> {
    const now = Date.now();

    // 1. Check in-memory map
    const memItem = memoryCache.get(cacheKey);
    if (memItem && memItem.expiresAt > now) {
      logger.info(`Cache HIT (Memory) for key: ${cacheKey}`);
      return memItem.data;
    }

    // 2. Check SQLite database
    try {
      const cached = await prisma.weatherCache.findUnique({
        where: { cacheKey },
      });

      if (cached && new Date(cached.expiresAt).getTime() > now) {
        logger.info(`Cache HIT (SQLite) for key: ${cacheKey}`);
        const parsedData: FullWeatherData = JSON.parse(cached.data);
        // Sync back to memory
        memoryCache.set(cacheKey, {
          data: parsedData,
          expiresAt: new Date(cached.expiresAt).getTime(),
        });
        return parsedData;
      }
    } catch (err) {
      logger.warn(`Failed to query SQLite cache for ${cacheKey}:`, err);
    }

    logger.info(`Cache MISS for key: ${cacheKey}`);
    return null;
  }

  static async setCachedWeather(cacheKey: string, data: FullWeatherData): Promise<void> {
    const expiresAt = new Date(Date.now() + this.CACHE_TTL_MS);

    // 1. Update Memory Map
    memoryCache.set(cacheKey, {
      data,
      expiresAt: expiresAt.getTime(),
    });

    // 2. Update SQLite database asynchronously
    try {
      const jsonString = JSON.stringify(data);
      await prisma.weatherCache.upsert({
        where: { cacheKey },
        update: {
          data: jsonString,
          expiresAt,
        },
        create: {
          cacheKey,
          data: jsonString,
          expiresAt,
        },
      });
    } catch (err) {
      logger.warn(`Failed to set SQLite cache for ${cacheKey}:`, err);
    }
  }
}
