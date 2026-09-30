import { Router } from 'express';
import { searchLocation } from '../controllers/locationController';
import { getWeather } from '../controllers/weatherController';
import {
  getVapidPublicKey,
  subscribe,
  sendTestNotification,
  getNotificationHistory,
  updateNotificationSettings,
} from '../controllers/notificationController';
import {
  sendWhatsAppReport,
  sendSMSReport,
  scheduleReport,
  getReportHistory,
} from '../controllers/reportController';
import {
  sendTestWhatsApp,
  sendTestSMS,
  getMessageHistory,
  triggerTestAlert,
} from '../controllers/messageController';
import {
  handleRagQuery,
  handleRagExplain,
  handleRagAdvice,
  handleRagAlertExplanation,
  handleRagTravelAdvice,
} from '../controllers/ragController';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Location Endpoints
router.get('/location/search', searchLocation);

// Weather Endpoints
router.get('/weather/current', getWeather);
router.get('/weather/hourly', getWeather);
router.get('/weather/forecast', getWeather);
router.get('/weather/air-quality', getWeather);

// Push Notification Endpoints
router.get('/notifications/vapid-key', getVapidPublicKey);
router.post('/notifications/subscribe', subscribe);
router.post('/notifications/test', sendTestNotification);
router.get('/notifications', getNotificationHistory);
router.put('/notifications/settings', updateNotificationSettings);

// Enterprise Messaging & Report Endpoints (Rate limited to 5 req/min)
router.post('/reports/weather/whatsapp', rateLimiter(5, 60000), sendWhatsAppReport);
router.post('/reports/weather/sms', rateLimiter(5, 60000), sendSMSReport);
router.post('/notifications/test-whatsapp', rateLimiter(5, 60000), sendTestWhatsApp);
router.post('/notifications/test-sms', rateLimiter(5, 60000), sendTestSMS);
router.post('/reports/schedule', scheduleReport);
router.get('/reports/history', getReportHistory);
router.get('/messages/history', getMessageHistory);
router.post('/alerts/test', triggerTestAlert);

// Hybrid RAG Pipeline Endpoints
router.post('/rag/query', rateLimiter(20, 60000), handleRagQuery);
router.post('/rag/explain', rateLimiter(20, 60000), handleRagExplain);
router.post('/rag/advice', rateLimiter(20, 60000), handleRagAdvice);
router.post('/rag/alert-explanation', rateLimiter(20, 60000), handleRagAlertExplanation);
router.post('/rag/travel-advice', rateLimiter(20, 60000), handleRagTravelAdvice);

export default router;
