import prisma from '../database/db';
import { logger } from '../utils/logger';
import { normalizePhoneNumber } from '../utils/phoneUtils';

export class SMSService {
  private static accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  private static authToken = process.env.TWILIO_AUTH_TOKEN || '';
  private static fromNumber = process.env.TWILIO_PHONE_NUMBER || '+18005550199';
  private static isTestMode = process.env.TEST_MODE === 'true';

  static validateE164(phone: string): boolean {
    try {
      normalizePhoneNumber(phone);
      return true;
    } catch {
      return false;
    }
  }

  static formatSMSReport(locationName: string, weatherData: any): string {
    const curr = weatherData.current || {};
    return `MausamLive Report: ${locationName} | Temp: ${curr.temperature ?? 'N/A'}°C (Feels ${
      curr.feelsLike ?? 'N/A'
    }°C) | Condition: ${curr.condition || 'Clear'} | Rain Chance: ${curr.rainProbability ?? 0}% | Precip: ${
      curr.rainfall ?? 0
    }mm | Wind: ${curr.windSpeed ?? 0}km/h | Source: Open-Meteo`;
  }

  static async sendSMS(
    recipientNumber: string,
    messageBody: string,
    messageType: 'report' | 'alert' | 'test' = 'report'
  ): Promise<{ success: boolean; messageId: string; status: string; isSimulated: boolean; error?: string }> {
    const cleanPhone = normalizePhoneNumber(recipientNumber);

    const hasLiveKeys =
      !!this.accountSid &&
      !this.accountSid.includes('Placeholder') &&
      !!this.authToken &&
      !this.authToken.includes('Placeholder');

    const deliveryRecord = await prisma.messageDelivery.create({
      data: {
        channel: 'sms',
        recipient: cleanPhone,
        messageType,
        status: hasLiveKeys && !this.isTestMode ? 'Queued' : 'Delivered (Simulated)',
      },
    });

    if (!hasLiveKeys || this.isTestMode) {
      // Test Mode Simulation
      const simulatedId = `SMS_SIM_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      logger.info(`[TEST MODE SIMULATION] SMS logged for ${cleanPhone}: ${simulatedId}`);

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
        To: cleanPhone,
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
      logger.error('SMS API sending failed:', err.message);

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
