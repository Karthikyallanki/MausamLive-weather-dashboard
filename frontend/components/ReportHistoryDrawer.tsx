'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  X,
  MessageCircle,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { fetchMessageDeliveryHistory, fetchReportHistory } from '../services/api';
import { formatTime } from '../lib/utils';

interface ReportHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportHistoryDrawer: React.FC<ReportHistoryDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deliveries' | 'reports'>('deliveries');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [msgData, repData] = await Promise.all([
        fetchMessageDeliveryHistory(),
        fetchReportHistory(),
      ]);
      setMessages(msgData);
      setReports(repData);
    } catch (err) {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-card border-l border-slate-200/50 dark:border-slate-800 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-sky-500" />
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Message & Delivery Log
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full glass-card hover:bg-sky-500/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 mb-4 rounded-xl glass-card border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'deliveries'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Delivery Statuses ({messages.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
                activeTab === 'reports'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Report History ({reports.length})
            </button>
          </div>

          {/* Refresh button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="text-[11px] font-semibold text-sky-500 flex items-center gap-1 hover:underline"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Logs
            </button>
          </div>

          {/* Deliveries Tab */}
          {activeTab === 'deliveries' && (
            <div className="space-y-3">
              {messages.length > 0 ? (
                messages.map((item) => {
                  let statusBadge = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  if (item.status === 'Delivered')
                    statusBadge = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                  if (item.status === 'Failed')
                    statusBadge = 'bg-red-500/10 text-red-600 dark:text-red-400';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                          {item.channel === 'whatsapp' && <MessageCircle className="w-4 h-4 text-emerald-500" />}
                          {item.channel === 'sms' && <MessageSquare className="w-4 h-4 text-sky-500" />}
                          {item.channel === 'push' && <Bell className="w-4 h-4 text-indigo-500" />}
                          <span className="capitalize">{item.channel}</span>
                        </div>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${statusBadge}`}>
                          {item.status}
                        </span>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                        Recipient: <strong className="text-slate-700 dark:text-slate-200">{item.recipient}</strong>
                      </p>

                      {item.providerMessageId && (
                        <p className="text-[10px] text-slate-400 font-mono">ID: {item.providerMessageId}</p>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200/30 dark:border-slate-800">
                        <span>Type: {item.messageType}</span>
                        <span>{formatTime(item.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">No delivery logs recorded yet.</p>
              )}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-3">
              {reports.length > 0 ? (
                reports.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl glass-card border border-slate-200/60 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{item.reportType}</span>
                      <span className="text-[10px] font-semibold text-sky-500 capitalize">{item.channel}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Location: {item.location}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-mono bg-slate-500/5 p-2 rounded-xl">
                      {item.content}
                    </p>
                    <div className="text-right text-[10px] text-slate-400">{formatTime(item.createdAt)}</div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-6">No report history recorded yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
