'use client';

import React, { useState } from 'react';
import { Sliders, Plus, Trash2, Bell, CheckCircle2, XCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { LocationResult } from '../types/weather';

interface AlertRule {
  id: string;
  metric: 'rainProbability' | 'tempMax' | 'tempMin' | 'windSpeed' | 'uvIndex' | 'aqi';
  operator: '>' | '<';
  threshold: number;
  channel: 'sms' | 'whatsapp' | 'browser';
  locationName: string;
  enabled: boolean;
}

interface PersonalAlertRulesProps {
  currentLocation: LocationResult;
}

const DEFAULT_RULES: AlertRule[] = [
  { id: '1', metric: 'rainProbability', operator: '>', threshold: 70, channel: 'browser', locationName: 'Visakhapatnam', enabled: true },
  { id: '2', metric: 'tempMax', operator: '>', threshold: 38, channel: 'sms', locationName: 'Visakhapatnam', enabled: true },
  { id: '3', metric: 'windSpeed', operator: '>', threshold: 40, channel: 'whatsapp', locationName: 'Visakhapatnam', enabled: false },
];

export const PersonalAlertRules: React.FC<PersonalAlertRulesProps> = ({ currentLocation }) => {
  const [rules, setRules] = useState<AlertRule[]>(DEFAULT_RULES);
  const [isAdding, setIsAdding] = useState(false);

  // New rule form
  const [newMetric, setNewMetric] = useState<AlertRule['metric']>('rainProbability');
  const [newOperator, setNewOperator] = useState<'<' | '>'>('>');
  const [newThreshold, setNewThreshold] = useState<number>(70);
  const [newChannel, setNewChannel] = useState<'sms' | 'whatsapp' | 'browser'>('browser');

  const handleToggleRule = (id: string) => {
    setRules(
      rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AlertRule = {
      id: Date.now().toString(),
      metric: newMetric,
      operator: newOperator,
      threshold: newThreshold,
      channel: newChannel,
      locationName: currentLocation.name,
      enabled: true,
    };
    setRules([...rules, newRule]);
    setIsAdding(false);
  };

  const getMetricLabel = (m: AlertRule['metric']) => {
    switch (m) {
      case 'rainProbability': return 'Rain Probability (%)';
      case 'tempMax': return 'High Temp (°C)';
      case 'tempMin': return 'Low Temp (°C)';
      case 'windSpeed': return 'Wind Speed (km/h)';
      case 'uvIndex': return 'UV Index';
      case 'aqi': return 'Air Quality Index';
    }
  };

  return (
    <div className="glass-card rounded-3xl p-6 lg:p-8 shadow-2xl border border-slate-200/50 dark:border-slate-800 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Personal Alert Rules</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create custom weather threshold triggers for automated SMS, WhatsApp & Push dispatches
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'New Rule'}
        </button>
      </div>

      {/* Add New Rule Form */}
      {isAdding && (
        <form onSubmit={handleAddRule} className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4 animate-fade-in">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Add Threshold Rule</h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Metric</label>
              <select
                value={newMetric}
                onChange={(e: any) => setNewMetric(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-card border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value="rainProbability">Rain Probability (%)</option>
                <option value="tempMax">High Temp (°C)</option>
                <option value="tempMin">Low Temp (°C)</option>
                <option value="windSpeed">Wind Speed (km/h)</option>
                <option value="uvIndex">UV Index</option>
                <option value="aqi">AQI</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Condition</label>
              <select
                value={newOperator}
                onChange={(e: any) => setNewOperator(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-card border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value=">">Exceeds (&gt;)</option>
                <option value="<">Drops Below (&lt;)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Threshold</label>
              <input
                type="number"
                value={newThreshold}
                onChange={(e) => setNewThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl glass-card border border-slate-300 dark:border-slate-700 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Channel</label>
              <select
                value={newChannel}
                onChange={(e: any) => setNewChannel(e.target.value)}
                className="w-full p-2.5 rounded-xl glass-card border border-slate-300 dark:border-slate-700 font-semibold"
              >
                <option value="browser">Browser Push</option>
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition"
          >
            Save Rule
          </button>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-4 rounded-2xl glass-card border flex items-center justify-between transition ${
              rule.enabled
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-slate-200/50 dark:border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleRule(rule.id)}
                className="p-1 rounded-full transition"
              >
                {rule.enabled ? (
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-400" />
                )}
              </button>

              <div>
                <div className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Notify when {getMetricLabel(rule.metric)} {rule.operator} {rule.threshold}
                </div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-2">
                  <span>Location: {rule.locationName}</span>
                  <span>•</span>
                  <span className="capitalize text-amber-500 font-bold">Via {rule.channel.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeleteRule(rule.id)}
              className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
