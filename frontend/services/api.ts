import { LocationResult, FullWeatherData, NotificationHistoryItem } from '../types/weather';

const API_BASE_URL = '/api';

export async function searchLocations(query: string): Promise<LocationResult[]> {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`${API_BASE_URL}/location/search?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) {
    throw new Error('Failed to search location');
  }
  const data = await res.json();
  return data.data || [];
}

export async function fetchWeather(
  lat: number,
  lon: number,
  locationName: string
): Promise<FullWeatherData> {
  const res = await fetch(
    `${API_BASE_URL}/weather/current?lat=${lat}&lon=${lon}&name=${encodeURIComponent(locationName)}`
  );
  if (!res.ok) {
    throw new Error('Weather data temporarily unavailable');
  }
  const data = await res.json();
  return data.data;
}

export async function getVapidPublicKey(): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/notifications/vapid-key`);
  if (!res.ok) throw new Error('Failed to fetch VAPID key');
  const data = await res.json();
  return data.publicKey;
}

export async function registerPushSubscription(
  subscription: PushSubscription,
  locationName: string,
  lat: number,
  lon: number
) {
  const res = await fetch(`${API_BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription,
      location: locationName,
      latitude: lat,
      longitude: lon,
    }),
  });
  if (!res.ok) throw new Error('Failed to save notification subscription');
  return await res.json();
}

export async function triggerTestNotification(endpoint?: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint }),
  });
  if (!res.ok) throw new Error('Failed to send test notification');
  return await res.json();
}

export async function fetchNotificationHistory(): Promise<NotificationHistoryItem[]> {
  const res = await fetch(`${API_BASE_URL}/notifications`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

// --- ENTERPRISE API CALLS ---

export async function sendWhatsAppReport(
  locationName: string,
  lat: number,
  lon: number,
  recipient: string,
  reportType: string = 'Current'
) {
  const res = await fetch(`${API_BASE_URL}/reports/weather/whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locationName, lat, lon, recipient, reportType }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'WhatsApp report failed');
  return data;
}

export async function sendSMSReport(
  locationName: string,
  lat: number,
  lon: number,
  recipient: string
) {
  const res = await fetch(`${API_BASE_URL}/reports/weather/sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ locationName, lat, lon, recipient }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'SMS report failed');
  return data;
}

export async function triggerTestWhatsApp(recipient: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/test-whatsapp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Test WhatsApp failed');
  return data;
}

export async function triggerTestSMS(recipient: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/test-sms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Test SMS failed');
  return data;
}

export async function scheduleWeatherReport(payload: {
  locationName: string;
  lat: number;
  lon: number;
  reportType: string;
  channel: string;
  recipient?: string;
  time: string;
}) {
  const res = await fetch(`${API_BASE_URL}/reports/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Schedule report failed');
  return data;
}

export async function fetchReportHistory() {
  const res = await fetch(`${API_BASE_URL}/reports/history`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function fetchMessageDeliveryHistory() {
  const res = await fetch(`${API_BASE_URL}/messages/history`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}
