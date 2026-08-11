import webpush from 'web-push';
import prisma from '../database/db';
import { logger } from '../utils/logger';

// Setup VAPID details from environment variables
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@mausamlive.com';

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(vapidEmail, publicVapidKey, privateVapidKey);
  logger.info('✅ Web Push VAPID keys initialized');
} else {
  logger.warn('⚠️ Web Push VAPID keys missing in environment variables');
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
}

export class WebPushService {
  static getPublicKey(): string {
    return publicVapidKey;
  }

  static async saveSubscription(
    endpoint: string,
    p256dh: string,
    auth: string,
    location?: string,
    latitude?: number,
    longitude?: number
  ) {
    try {
      const subscription = await prisma.notificationSubscription.upsert({
        where: { endpoint },
        update: {
          p256dh,
          auth,
          location: location || 'Hyderabad, India',
          latitude: latitude || 17.385,
          longitude: longitude || 78.4866,
        },
        create: {
          endpoint,
          p256dh,
          auth,
          location: location || 'Hyderabad, India',
          latitude: latitude || 17.385,
          longitude: longitude || 78.4866,
          settings: {
            create: {
              rainAlerts: true,
              heavyRainAlerts: true,
              thunderstormAlerts: true,
              temperatureAlerts: true,
              strongWindAlerts: true,
              airQualityAlerts: true,
            },
          },
        },
        include: { settings: true },
      });
      return subscription;
    } catch (error) {
      logger.error('Failed to save subscription:', error);
      throw error;
    }
  }

  static async sendNotification(
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: PushNotificationPayload
  ): Promise<boolean> {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    try {
      await webpush.sendNotification(
        pushSubscription,
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          icon: payload.icon || '/icon-192x192.png',
          badge: payload.badge || '/badge-72x72.png',
          data: payload.data || {},
        })
      );
      logger.info(`Push notification sent successfully to ${subscription.endpoint.slice(0, 30)}...`);
      return true;
    } catch (err: any) {
      logger.error(`Error sending push notification (status ${err.statusCode}):`, err.message);
      if (err.statusCode === 410 || err.statusCode === 404) {
        // Subscription expired or unsubscribed, remove from DB
        try {
          await prisma.notificationSubscription.delete({
            where: { endpoint: subscription.endpoint },
          });
          logger.info(`Cleaned up expired subscription: ${subscription.endpoint.slice(0, 30)}...`);
        } catch (delErr) {
          // ignore
        }
      }
      return false;
    }
  }
}
