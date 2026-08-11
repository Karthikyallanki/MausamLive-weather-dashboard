import { Request, Response, NextFunction } from 'express';
import prisma from '../database/db';
import { WhatsAppService } from '../services/whatsappService';
import { SMSService } from '../services/smsService';

export const sendTestWhatsApp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipient } = req.body;
    const phone = recipient || '+919876543210';

    const testMsg = '🌤️ MausamLive Test: Your WhatsApp weather reports are working correctly!';
    const result = await WhatsAppService.sendWhatsApp(phone, testMsg, 'test');

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Test WhatsApp message dispatched successfully to ${phone}.`
        : `Failed to send test WhatsApp: ${result.error}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestSMS = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { recipient } = req.body;
    const phone = recipient || '+919876543210';

    const testMsg = 'MausamLive Test: Your weather SMS notifications are working correctly.';
    const result = await SMSService.sendSMS(phone, testMsg, 'test');

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? `Test SMS message dispatched successfully to ${phone}.`
        : `Failed to send test SMS: ${result.error}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMessageHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const messages = await prisma.messageDelivery.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const triggerTestAlert = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type = 'rain', location = 'Hyderabad, India', channel = 'browser' } = req.body;

    const alertLog = await prisma.notification.create({
      data: {
        title: `⚡ TEST ALERT: ${type.toUpperCase()} WARNING`,
        message: `This is a test alert condition for ${location} via ${channel}.`,
        type,
        location,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Test ${type} alert triggered successfully for ${location}.`,
      data: alertLog,
    });
  } catch (error) {
    next(error);
  }
};
