import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, ExternalLink, CheckCircle2, ArrowRight, Minimize2 } from 'lucide-react';
import { api } from '../services/api';
import { AIChatResponse } from '../types';

interface FloatingChatbotProps {
  onNavigateToApp: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

const QUICK_PROMPTS = [
  "When is JEE Main 2027 registration?",
  "What documents are needed?",
  "How does change detection work?",
  "Does the AI guess missing dates?"
];

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ onNavigateToApp }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `👋 Hi there! I am the **ExamAlert AI Copilot**.\n\nI answer queries strictly using **verified official portals** (NTA, IIT, IIM, SSC, UPSC) with zero hallucinated dates.\n\nTry asking about upcoming registration dates or how our scrapers detect changes!`,
      sources: ["https://jeemain.nta.nic.in"]
    }
  ]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);

    try {
      const res: AIChatResponse = await api.askAI(query);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I am having trouble connecting to the verified portal database right now. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 text-white rounded-full shadow-float hover:shadow-glow-indigo transition-all duration-300 flex items-center space-x-2 active:scale-95 animate-float-slow"
        >
          {/* Pulsing ring */}
          <span className="absolute -inset-1 rounded-full bg-indigo-500/40 animate-ping pointer-events-none" />

          <div className="relative flex items-center space-x-2.5">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin-slow" />
            <span className="text-xs font-extrabold pr-1 tracking-tight hidden sm:inline">
              Ask AI Copilot
            </span>
          </div>

          {/* Status Dot */}
          <span className="absolute top-1 right-1 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
        </button>
      )}

      {/* Expanded Chat Widget */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-extrabold tracking-tight">ExamAlert AI Copilot</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-indigo-200 font-medium">Official Exam Knowledge Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Minimize"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold shrink-0 transition-all shadow-2xs whitespace-nowrap"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 ${
                  m.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3 rounded-2xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 whitespace-pre-line'
                  }`}
                >
                  {m.content}

                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-400 font-bold block mb-1">Official Citation:</span>
                      {m.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-indigo-600 hover:underline truncate"
                        >
                          <ExternalLink className="w-2.5 h-2.5 mr-1 shrink-0" />
                          <span className="truncate">{s}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs animate-pulse">
                <Bot className="w-4 h-4 text-indigo-600" />
                <span>Scanning official authority records...</span>
              </div>
            )}
          </div>

          {/* CTA Footer: Enter Dashboard */}
          <div className="px-4 py-2 bg-indigo-50/80 border-t border-indigo-100 flex items-center justify-between text-[11px]">
            <span className="text-indigo-900 font-semibold flex items-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
              Want real-time Telegram alerts?
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                onNavigateToApp();
              }}
              className="font-bold text-indigo-700 hover:text-indigo-900 flex items-center space-x-0.5"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask when is registration, required docs..."
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-sm active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
