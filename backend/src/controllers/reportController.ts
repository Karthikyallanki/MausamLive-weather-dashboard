import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';
import { OpenMeteoProvider } from '../providers/openMeteoProvider';
import { WhatsAppService } from '../services/whatsappService';
import { SMSService } from '../services/smsService';

const provider = new OpenMeteoProvider();

export const sendWhatsAppReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationName, lat, lon, recipient, reportType = 'Current' } = req.body;

    if (!lat || !lon || !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Parameters "lat", "lon", and "recipient" (phone number) are required.',
      });
    }

    const weather = await provider.getWeatherByCoords(parseFloat(lat), parseFloat(lon), locationName || 'Selected Location');
    const messageBody = WhatsAppService.formatWeatherReport(locationName || 'Selected Location', weather, reportType);

    const result = await WhatsAppService.sendWhatsApp(recipient, messageBody, 'report');

    if (result.success) {
      await prisma.reportHistory.create({
        data: {
          location: locationName || 'Selected Location',
          reportType,
          channel: 'whatsapp',
          recipient,
          status: result.status,
          content: messageBody,
        },
      });
    }

    return res.status(200).json({
      success: result.success,
      message: `💬 Weather report sent successfully via WhatsApp to ${recipient}!`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sendSMSReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationName, lat, lon, recipient } = req.body;

    if (!lat || !lon || !recipient) {
      return res.status(400).json({
        success: false,
        message: 'Parameters "lat", "lon", and "recipient" (E.164 phone number) are required.',
      });
    }

    const weather = await provider.getWeatherByCoords(parseFloat(lat), parseFloat(lon), locationName || 'Selected Location');
    const messageBody = SMSService.formatSMSReport(locationName || 'Selected Location', weather);

    const result = await SMSService.sendSMS(recipient, messageBody, 'report');

    if (result.success) {
      await prisma.reportHistory.create({
        data: {
          location: locationName || 'Selected Location',
          reportType: 'SMS Weather Report',
          channel: 'sms',
          recipient,
          status: result.status,
          content: messageBody,
        },
      });
    }

    return res.status(200).json({
      success: result.success,
      message: `📱 Real weather report sent successfully via SMS to ${recipient}!`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const scheduleReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationName, lat, lon, reportType, channel, recipient, time } = req.body;

    if (!locationName || !lat || !lon || !reportType || !channel || !time) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: locationName, lat, lon, reportType, channel, time (HH:mm).',
      });
    }

    const newSchedule = await prisma.scheduledReport.create({
      data: {
        location: locationName,
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        reportType,
        channel,
        recipient: recipient || null,
        time,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Scheduled ${reportType} report via ${channel.toUpperCase()} for ${time} daily.`,
      data: newSchedule,
    });
  } catch (error) {
    next(error);
  }
};

export const getReportHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const history = await prisma.reportHistory.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};
