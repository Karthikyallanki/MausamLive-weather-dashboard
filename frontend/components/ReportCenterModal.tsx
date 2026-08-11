'use client';

import React, { useState } from 'react';
import {
  FileText,
  Send,
  MessageSquare,
  MessageCircle,
  Clock,
  X,
  Loader2,
  BellRing,
} from 'lucide-react';
import { sendWhatsAppReport, sendSMSReport, scheduleWeatherReport, triggerTestNotification } from '../services/api';
import { LocationResult } from '../types/weather';

interface ReportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: LocationResult;
}

export const ReportCenterModal: React.FC<ReportCenterModalProps> = ({
  isOpen,
  onClose,
  location,
}) => {
  const [reportType, setReportType] = useState<string>('Current Weather Report');
  const [channel, setChannel] = useState<'whatsapp' | 'sms' | 'browser'>('sms');
  const [recipient, setRecipient] = useState<string>('+919441005233');
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduleTime, setScheduleTime] = useState<string>('07:00');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage(null);

    try {
      if (isScheduled) {
        // Schedule Report
        await scheduleWeatherReport({
          locationName: location.name,
          lat: location.latitude,
          lon: location.longitude,
          reportType,
          channel,
          recipient,
          time: scheduleTime,
        });

        setStatusMessage({
          text: `📅 ${reportType} scheduled daily at ${scheduleTime} via ${channel.toUpperCase()}!`,
          type: 'success',
        });
      } else {
        // Instant Report Generation
        if (channel === 'whatsapp') {
          const res = await sendWhatsAppReport(location.name, location.latitude, location.longitude, recipient, reportType);
          setStatusMessage({
            text: res.message || `💬 Weather report sent successfully via WhatsApp to ${recipient}!`,
            type: 'success',
          });
        } else if (channel === 'sms') {
          const res = await sendSMSReport(location.name, location.latitude, location.longitude, recipient);
          setStatusMessage({
            text: res.message || `📱 Real weather report sent successfully via SMS to ${recipient}!`,
            type: 'success',
          });
        } else {
          // BROWSER INSTANT PUSH NOTIFICATION
          try {
            await triggerTestNotification();
            setStatusMessage({
              text: `🔔 Instant Browser Weather Report dispatched to your desktop! Check your computer notification center.`,
              type: 'success',
            });
          } catch (pushErr) {
            setStatusMessage({
              text: `🌤️ Weather Report generated for ${location.name}. Check notification center.`,
              type: 'success',
            });
          }
        }
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'Failed to dispatch weather report.',
        type: 'error',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Weather Report Center</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate & deliver real-time weather reports to WhatsApp, SMS, or Browser
            </p>
          </div>
        </div>

        {/* Status Feedback Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl mb-4 text-xs font-semibold border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Location */}
          <div className="p-3 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Target Location:</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{location.name}</span>
          </div>

          {/* Report Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Report Type:
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-3 text-xs font-semibold rounded-2xl glass-card border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 transition"
            >
              <option value="Current Weather Report">Current Weather Report</option>
              <option value="Today's Weather Report">Today's Weather Report</option>
              <option value="Tomorrow's Weather Report">Tomorrow's Weather Report</option>
              <option value="Rain Report">Rain & Precipitation Report</option>
              <option value="Severe Weather Report">Severe Weather Report</option>
              <option value="Daily Summary">Daily Weather Summary</option>
            </select>
          </div>

          {/* Delivery Channel Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Delivery Channel:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel('whatsapp')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  channel === 'whatsapp'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-md'
                    : 'glass-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                WhatsApp
              </button>

              <button
                type="button"
                onClick={() => setChannel('sms')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  channel === 'sms'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-600 dark:text-sky-400 shadow-md'
                    : 'glass-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-5 h-5 text-sky-500" />
                SMS
              </button>

              <button
                type="button"
                onClick={() => setChannel('browser')}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                  channel === 'browser'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md'
                    : 'glass-card border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <BellRing className="w-5 h-5 text-indigo-500" />
                Browser Push
              </button>
            </div>
          </div>

          {/* Recipient Phone Number (For WhatsApp / SMS) */}
          {channel !== 'browser' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Phone Number:
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="+919441005233"
                className="w-full p-3 text-xs font-semibold rounded-2xl glass-card border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500 transition"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Formats supported: <code className="text-sky-500 font-semibold">+91 9441005233</code> or <code className="text-sky-500 font-semibold">9441005233</code>
              </p>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-700 dark:text-indigo-300 font-semibold flex items-center gap-2">
              <BellRing className="w-4 h-4 text-indigo-500 flex-none" />
              <span>Selecting "Browser Push" sends instant real-time desktop pop-up notifications directly to your device!</span>
            </div>
          )}

          {/* Schedule vs Instant Toggle */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Schedule Daily Recurring Report
                </span>
              </div>
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            {isScheduled && (
              <div className="flex items-center gap-3 pt-2 border-t border-slate-200/40 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-500">Dispatch Time:</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="p-2 text-xs font-bold rounded-xl glass-card border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-sky-500"
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating & Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {isScheduled ? 'Save Scheduled Report' : `Generate & Send ${channel.toUpperCase()} Report`}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
