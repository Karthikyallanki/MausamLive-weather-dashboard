import cron from 'node-cron';
import prisma from '../database/db';
import { OpenMeteoProvider } from '../providers/openMeteoProvider';
import { WebPushService } from './webPushService';
import { WhatsAppService } from '../services/whatsappService';
import { SMSService } from '../services/smsService';
import { logger } from '../utils/logger';

const weatherProvider = new OpenMeteoProvider();

// Prevent duplicate alert notifications for the same location within 3 hours
const recentAlertsSent = new Map<string, number>();

export function initAlertCron() {
  logger.info('⏰ Initializing Multi-Channel Weather Alert & Scheduled Report Cron...');

  // Task 1: Check Weather Alerts every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('🔍 Running scheduled weather alert evaluation check...');
    try {
      const subscriptions = await prisma.notificationSubscription.findMany({
        include: { settings: true },
      });

      if (subscriptions.length === 0) return;

      for (const sub of subscriptions) {
        const lat = sub.latitude || 17.385;
        const lon = sub.longitude || 78.4866;
        const locationName = sub.location || 'Hyderabad, India';
        const settings = sub.settings;

        if (!settings) continue;

        try {
          const weather = await weatherProvider.getWeatherByCoords(lat, lon, locationName);
          const alerts = weather.alerts;

          for (const alert of alerts) {
            const cacheKey = `${sub.id}-${alert.type}-${locationName}`;
            const lastSent = recentAlertsSent.get(cacheKey) || 0;
            const threeHoursMs = 3 * 60 * 60 * 1000;

            if (Date.now() - lastSent < threeHoursMs) {
              // Skip duplicate alert within 3-hour window
              continue;
            }

            let alertTriggered = false;
            if (alert.type === 'rain' && settings.rainAlerts) alertTriggered = true;
            if (alert.type === 'thunderstorm' && settings.thunderstormAlerts) alertTriggered = true;
            if ((alert.type === 'heat' || alert.type === 'cold') && settings.temperatureAlerts) alertTriggered = true;
            if (alert.type === 'wind' && settings.strongWindAlerts) alertTriggered = true;
            if (alert.type === 'aqi' && settings.airQualityAlerts) alertTriggered = true;

            if (alertTriggered) {
              // 1. Browser Push
              if (settings.enableBrowser ?? true) {
                await WebPushService.sendNotification(sub, {
                  title: alert.title,
                  body: `${alert.description} (${locationName})`,
                  data: { url: '/', location: locationName, type: alert.type },
                });
              }

              // 2. WhatsApp Alert
              if (settings.enableWhatsApp && settings.whatsappNumber) {
                const waText = `🚨 *${alert.title}*\n📍 *Location:* ${locationName}\nℹ️ ${alert.description}`;
                await WhatsAppService.sendWhatsApp(settings.whatsappNumber, waText, 'alert');
              }

              // 3. SMS Alert
              if (settings.enableSMS && settings.phoneNumber) {
                const smsText = `MausamLive Alert: ${alert.title} in ${locationName}. ${alert.description}`;
                await SMSService.sendSMS(settings.phoneNumber, smsText, 'alert');
              }

              recentAlertsSent.set(cacheKey, Date.now());

              await prisma.notification.create({
                data: {
                  title: alert.title,
                  message: alert.description,
                  type: alert.type,
                  location: locationName,
                },
              });
            }
          }
        } catch (weatherErr) {
          logger.warn(`Failed to check weather alerts for ${locationName}:`, weatherErr);
        }
      }
    } catch (err) {
      logger.error('Error during scheduled alert cron job:', err);
    }
  });

  // Task 2: Check Scheduled Weather Reports every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const activeSchedules = await prisma.scheduledReport.findMany({
        where: {
          time: currentHHMM,
          isActive: true,
        },
      });

      if (activeSchedules.length === 0) return;

      for (const sched of activeSchedules) {
        logger.info(`⏰ Executing scheduled report for ${sched.location} via ${sched.channel} at ${currentHHMM}`);
        try {
          const weather = await weatherProvider.getWeatherByCoords(sched.latitude, sched.longitude, sched.location);

          if (sched.channel === 'whatsapp' && sched.recipient) {
            const msg = WhatsAppService.formatWeatherReport(sched.location, weather, sched.reportType);
            await WhatsAppService.sendWhatsApp(sched.recipient, msg, 'report');
          } else if (sched.channel === 'sms' && sched.recipient) {
            const msg = SMSService.formatSMSReport(sched.location, weather);
            await SMSService.sendSMS(sched.recipient, msg, 'report');
          }

          await prisma.reportHistory.create({
            data: {
              location: sched.location,
              reportType: sched.reportType,
              channel: sched.channel,
              recipient: sched.recipient,
              status: 'Delivered',
              content: `Scheduled ${sched.reportType} report sent at ${currentHHMM}`,
            },
          });
        } catch (schedErr) {
          logger.warn(`Failed scheduled report for ${sched.location}:`, schedErr);
        }
      }
    } catch (err) {
      logger.error('Error in scheduled report cron job:', err);
    }
  });
}
