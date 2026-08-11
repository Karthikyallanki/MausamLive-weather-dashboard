import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';
import { WebPushService } from '../notifications/webPushService';

export const getVapidPublicKey = (req: Request, res: Response) => {
  const key = WebPushService.getPublicKey();
  res.status(200).json({ success: true, publicKey: key });
};

export const subscribe = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { subscription, location, latitude, longitude } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription payload. Required: endpoint, keys.p256dh, keys.auth',
      });
    }

    const saved = await WebPushService.saveSubscription(
      subscription.endpoint,
      subscription.keys.p256dh,
      subscription.keys.auth,
      location,
      latitude,
      longitude
    );

    return res.status(200).json({
      success: true,
      message: 'Subscribed to weather notifications successfully.',
      subscriptionId: saved.id,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { endpoint } = req.body;

    if (endpoint) {
      const sub = await prisma.notificationSubscription.findUnique({
        where: { endpoint },
      });

      if (!sub) {
        return res.status(404).json({
          success: false,
          message: 'Subscription not found for the provided endpoint.',
        });
      }

      const success = await WebPushService.sendNotification(sub, {
        title: '🌤️ MausamLive Test Notification',
        body: `Your real browser weather notifications are working perfectly for ${sub.location || 'your location'}!`,
        data: { url: '/' },
      });

      if (success) {
        await prisma.notification.create({
          data: {
            title: '🌤️ Test Notification Sent',
            message: 'Web Push test notification delivered successfully.',
            type: 'info',
            location: sub.location || 'Current Location',
          },
        });
      }

      return res.status(200).json({
        success,
        message: success
          ? 'Test push notification sent successfully.'
          : 'Failed to send test push notification.',
      });
    }

    // Send to all subscriptions as fallback test
    const allSubs = await prisma.notificationSubscription.findMany();
    if (allSubs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No notification subscriptions found. Please enable notifications in your browser first.',
      });
    }

    let sentCount = 0;
    for (const sub of allSubs) {
      const sent = await WebPushService.sendNotification(sub, {
        title: '🌤️ MausamLive Test Notification',
        body: 'Your weather notifications are active and working correctly!',
      });
      if (sent) sentCount++;
    }

    return res.status(200).json({
      success: true,
      message: `Test notification sent to ${sentCount} subscriber(s).`,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotificationSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { endpoint, settings } = req.body;

    if (!endpoint || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Endpoint and settings object are required.',
      });
    }

    const sub = await prisma.notificationSubscription.findUnique({
      where: { endpoint },
    });

    if (!sub) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found.',
      });
    }

    const updated = await prisma.notificationSettings.update({
      where: { subscriptionId: sub.id },
      data: {
        rainAlerts: settings.rainAlerts ?? true,
        heavyRainAlerts: settings.heavyRainAlerts ?? true,
        thunderstormAlerts: settings.thunderstormAlerts ?? true,
        temperatureAlerts: settings.temperatureAlerts ?? true,
        strongWindAlerts: settings.strongWindAlerts ?? true,
        airQualityAlerts: settings.airQualityAlerts ?? true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};
