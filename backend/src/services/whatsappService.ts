import prisma from '../database/db';
import { logger } from '../utils/logger';
import { normalizePhoneNumber } from '../utils/phoneUtils';

export class WhatsAppService {
  private static accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private static authToken = process.env.TWILIO_AUTH_TOKEN || '';
  private static fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
  private static isTestMode = process.env.TEST_MODE === 'true';

  static formatWeatherReport(locationName: string, weatherData: any, reportType: string = 'Current'): string {
    const curr = weatherData.current || {};
    const rainProb = curr.rainProbability ?? 0;
    const precip = curr.rainfall ?? 0;
    const updatedTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return `🌤️ *MausamLive ${reportType} Weather Report*

📍 *Location:* ${locationName}
🌡️ *Temperature:* ${curr.temperature ?? 'N/A'}°C
🌡️ *Feels Like:* ${curr.feelsLike ?? 'N/A'}°C
☁️ *Condition:* ${curr.condition || 'Clear'}
🌧️ *Rain Probability:* ${rainProb}%
💧 *Precipitation:* ${precip} mm
💨 *Wind Speed:* ${curr.windSpeed ?? 0} km/h
💧 *Humidity:* ${curr.humidity ?? 0}%
☀️ *UV Index:* ${curr.uvIndex ?? 0}
🌅 *Sunrise:* ${curr.sunrise ? curr.sunrise.split('T')[1] || curr.sunrise : 'N/A'}
🌇 *Sunset:* ${curr.sunset ? curr.sunset.split('T')[1] || curr.sunset : 'N/A'}

⏰ *Updated:* ${updatedTime}
ℹ️ *Source:* Real-time weather data from Open-Meteo`;
  }

  static async sendWhatsApp(
    recipientNumber: string,
    messageBody: string,
    messageType: 'report' | 'alert' | 'test' = 'report'
  ): Promise<{ success: boolean; messageId: string; status: string; isSimulated: boolean; error?: string }> {
    const normalizedPhone = normalizePhoneNumber(recipientNumber);
    const formattedRecipient = normalizedPhone.startsWith('whatsapp:')
      ? normalizedPhone
      : `whatsapp:${normalizedPhone}`;

    const hasLiveKeys =
      !!this.accountSid &&
      !this.accountSid.includes('Placeholder') &&
      !!this.authToken &&
      !this.authToken.includes('Placeholder');

    const deliveryRecord = await prisma.messageDelivery.create({
      data: {
        channel: 'whatsapp',
        recipient: normalizedPhone.replace('whatsapp:', ''),
        messageType,
        status: hasLiveKeys && !this.isTestMode ? 'Queued' : 'Delivered (Simulated)',
      },
    });

    if (!hasLiveKeys || this.isTestMode) {
      // Test Mode Simulation
      const simulatedId = `WA_SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      logger.info(`[TEST MODE SIMULATION] WhatsApp logged for ${formattedRecipient}: ${simulatedId}`);

      await prisma.messageDelivery.update({
        where: { id: deliveryRecord.id },
        data: {
          status: 'Delivered (Simulated)',
          providerMessageId: simulatedId,
        },
      });

      return {
        success: true,
        messageId: simulatedId,
        status: 'Delivered (Test Mode Simulation)',
        isSimulated: true,
      };
    }

    // Real Twilio API Call
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const bodyParams = new URLSearchParams({
        From: this.fromNumber,
        To: formattedRecipient,
        Body: messageBody,
      });

      const authHeader = 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: authHeader,
        },
        body: bodyParams,
      });

      const resJson: any = await response.json();

      if (!response.ok) {
        throw new Error(resJson.message || `Twilio HTTP status ${response.status}`);
      }

      await prisma.messageDelivery.update({
        where: { id: deliveryRecord.id },
        data: {
          status: 'Sent',
          providerMessageId: resJson.sid,
        },
      });

      return {
        success: true,
        messageId: resJson.sid,
        status: resJson.status || 'Sent',
        isSimulated: false,
      };
    } catch (err: any) {
      logger.error('WhatsApp API sending failed:', err.message);

      await prisma.messageDelivery.update({
        where: { id: deliveryRecord.id },
        data: {
          status: 'Failed',
          errorMessage: err.message,
        },
      });

      return {
        success: false,
        messageId: deliveryRecord.id,
        status: 'Failed',
        isSimulated: false,
        error: err.message,
      };
    }
  }
}
