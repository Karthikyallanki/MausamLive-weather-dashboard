import { Request, Response, NextFunction } from 'express';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (maxRequests = 5, windowMs = 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const currentRecord = rateLimitMap.get(ip);

    if (!currentRecord || currentRecord.resetTime < now) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (currentRecord.count >= maxRequests) {
      const retrySecs = Math.ceil((currentRecord.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Too many messaging requests from this IP. Please try again in ${retrySecs} seconds.`,
      });
    }

    currentRecord.count += 1;
    return next();
  };
};
