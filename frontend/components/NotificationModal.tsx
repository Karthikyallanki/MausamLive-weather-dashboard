'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  Send,
  Loader2,
  X,
  History,
  ShieldCheck,
  AlertCircle,
  MessageCircle,
  MessageSquare,
} from 'lucide-react';
import {
  getVapidPublicKey,
  registerPushSubscription,
  triggerTestNotification,
  triggerTestWhatsApp,
  triggerTestSMS,
  fetchNotificationHistory,
} from '../services/api';
import { NotificationHistoryItem } from '../types/weather';
import { formatTime } from '../lib/utils';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocationName: string;
  lat: number;
  lon: number;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  currentLocationName,
  lat,
  lon,
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [phone, setPhone] = useState<string>('+919876543210');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testChannel, setTestChannel] = useState<'browser' | 'whatsapp' | 'sms'>('browser');
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchNotificationHistory().then(setHistory).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const handleEnableNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatusMessage({ text: 'Push notifications are not supported in this browser.', type: 'error' });
      return;
    }

    setIsSubscribing(true);
    setStatusMessage(null);

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== 'granted') {
        setStatusMessage({
          text: 'Notifications permission denied. Please allow notifications in browser settings.',
          type: 'error',
        });
        setIsSubscribing(false);
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      const vapidPublicKey = await getVapidPublicKey();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      await registerPushSubscription(subscription, currentLocationName, lat, lon);

      setStatusMessage({
        text: '🎉 Browser weather notifications enabled successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to enable push notifications.',
        type: 'error',
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestBrowser = async () => {
    setIsSendingTest(true);
    setTestChannel('browser');
    setStatusMessage(null);
    try {
      let endpoint: string | undefined = undefined;
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) endpoint = sub.endpoint;
        }
      }

      const res = await triggerTestNotification(endpoint);
      if (res.success) {
        setStatusMessage({
          text: '🌤️ Test browser notification sent successfully!',
          type: 'success',
        });
      } else {
        setStatusMessage({ text: res.message || 'Failed to send test browser notification', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Error triggering test notification', type: 'error' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendTestWhatsApp = async () => {
    setIsSendingTest(true);
    setTestChannel('whatsapp');
    setStatusMessage(null);
    try {
      const res = await triggerTestWhatsApp(phone);
      if (res.success) {
        setStatusMessage({
          text: `💬 Real WhatsApp test message sent to ${phone}!`,
          type: 'success',
        });
      } else {
        setStatusMessage({ text: res.message || 'WhatsApp test failed', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Error sending test WhatsApp', type: 'error' });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleSendTestSMS = async () => {
    setIsSendingTest(true);
    setTestChannel('sms');
    setStatusMessage(null);
    try {
      const res = await triggerTestSMS(phone);
      if (res.success) {
        setStatusMessage({
          text: `📱 Real SMS test message sent to ${phone}!`,
          type: 'success',
        });
      } else {
        setStatusMessage({ text: res.message || 'SMS test failed', type: 'error' });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Error sending test SMS', type: 'error' });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-500">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Multi-Channel Alert Center</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure Browser, WhatsApp & SMS Weather Alerts
            </p>
          </div>
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-xs font-semibold border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Browser Push Button */}
        <div className="mb-6 space-y-3">
          <button
            onClick={handleEnableNotifications}
            disabled={isSubscribing}
            className="w-full py-3 px-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up Web Push...
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Enable Browser Push Notifications
              </>
            )}
          </button>
        </div>

        {/* Phone Input for SMS & WhatsApp */}
        <div className="mb-6 space-y-2 p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            WhatsApp / SMS Phone Number (E.164 format):
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+919876543210"
            className="w-full p-2.5 text-xs font-semibold rounded-xl glass-card border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* TEST BUTTONS SECTION */}
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Send Test Notifications (Required Features)
          </h4>

          <div className="grid grid-cols-3 gap-2">
            {/* Test Browser */}
            <button
              onClick={handleSendTestBrowser}
              disabled={isSendingTest}
              className="py-2.5 px-2 rounded-xl glass-card hover:bg-sky-500/10 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSendingTest && testChannel === 'browser' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-sky-500" />
              )}
              Test Browser
            </button>

            {/* REQUIRED TEST WHATSAPP */}
            <button
              onClick={handleSendTestWhatsApp}
              disabled={isSendingTest}
              className="py-2.5 px-2 rounded-xl glass-card hover:bg-emerald-500/10 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSendingTest && testChannel === 'whatsapp' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
              )}
              Test WhatsApp
            </button>

            {/* REQUIRED TEST SMS */}
            <button
              onClick={handleSendTestSMS}
              disabled={isSendingTest}
              className="py-2.5 px-2 rounded-xl glass-card hover:bg-sky-500/10 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isSendingTest && testChannel === 'sms' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-500" />
              ) : (
                <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
              )}
              Test SMS
            </button>
          </div>
        </div>

        {/* History Preview */}
        <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-sky-500" />
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Recent Push Log
            </h4>
          </div>
          {history.length > 0 ? (
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-xl glass-card border border-slate-200/40 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                    <span>{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{formatTime(item.createdAt)}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic text-center py-2">No notification logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
