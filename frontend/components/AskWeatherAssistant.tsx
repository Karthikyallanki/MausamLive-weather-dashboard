import React, { useState } from 'react';
import { Sparkles, Send, Bot, User, RefreshCw, X, HelpCircle, ShieldCheck } from 'lucide-react';
import { queryRag } from '../services/api';
import { RAGSourcePanel, SourceItem } from './RAGSourcePanel';

interface AskWeatherAssistantProps {
  currentLocationName?: string;
  liveWeatherData?: any;
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: SourceItem[];
  classification?: any;
  timestamp: string;
}

export const AskWeatherAssistant: React.FC<AskWeatherAssistantProps> = ({
  currentLocationName = 'Hyderabad, India',
  liveWeatherData,
  isOpen = false,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: `Hello! I am your **MausamLive AI Weather Assistant**. Ask me anything about live conditions in ${currentLocationName}, rain probability, UV safety, AQI, or weather science!`,
      timestamp: 'Just now',
    },
  ]);

  const sampleQuestions = [
    "Will it rain today?",
    "Why is humidity high?",
    "Should I carry an umbrella?",
    "What does 70% rain probability mean?",
    "Is today's UV index dangerous?",
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuery('');
    setLoading(true);

    try {
      const res = await queryRag(text, currentLocationName, liveWeatherData);
      const botMsg: Message = {
        sender: 'bot',
        text: res.answer,
        sources: res.sources,
        classification: res.classification,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I ran into an error connecting to the weather knowledge pipeline. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-5 shadow-2xl backdrop-blur-xl mb-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              Ask MausamLive <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">Hybrid RAG</span>
            </h2>
            <p className="text-xs text-slate-400">Live Weather Data + Grounded Meteorological Knowledge</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Suggested Quick Questions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={loading}
            className="text-xs bg-slate-800/80 hover:bg-sky-600/30 border border-slate-700 hover:border-sky-500/50 text-slate-300 hover:text-sky-200 rounded-lg px-3 py-1.5 transition-all text-left"
          >
            💡 {q}
          </button>
        ))}
      </div>

      {/* Message Chat Feed */}
      <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-100 border border-slate-700/80 rounded-tl-none'
              }`}
            >
              {msg.classification && (
                <div className="text-[11px] font-semibold tracking-wider text-sky-400 uppercase mb-1">
                  Categorized: {msg.classification.query_type}
                </div>
              )}
              <div className="whitespace-pre-line">{msg.text}</div>
              {msg.sources && <RAGSourcePanel sources={msg.sources} />}
              <span className="block text-[10px] text-slate-400 mt-2 text-right">{msg.timestamp}</span>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 text-xs text-sky-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Retrieving live data & vector knowledge...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl p-1.5 focus-within:border-sky-500 transition-all"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask about weather in ${currentLocationName} or weather concepts...`}
          className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none px-3 placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="p-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-bold transition-all shadow-md"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
