import React, { useState } from 'react';
import { X, Sparkles, Send, Bot, User as UserIcon, ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { AIChatResponse } from '../types';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggested_actions?: string[];
}

const PRESET_QUESTIONS = [
  "When is my JEE deadline?",
  "What documents do I need?",
  "What changed in the latest GATE notice?",
  "Show my upcoming deadlines",
  "What should I do after registration?"
];

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({ isOpen, onClose, userId = 1 }) => {
  if (!isOpen) return null;

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `👋 Hello! I am your **ExamAlert AI Assistant** ("What Should I Do?").\n\nI answer questions strictly using our database of **verified official notices and deadlines** for competitive exams like JEE Main, NEET, GATE, CAT, and SSC.\n\nAsk me about upcoming deadlines, required documents, or notice details!`,
      suggested_actions: ["Check upcoming deadlines", "View monitored exams"]
    }
  ]);

  const handleSend = async (questionToSend?: string) => {
    const q = questionToSend || input;
    if (!q.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res: AIChatResponse = await api.askAI(q, userId);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: res.answer,
          sources: res.sources,
          suggested_actions: res.suggested_actions
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't reach the official knowledge engine. Please check your network or try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">"What Should I Do?" AI</h3>
              <p className="text-[11px] text-indigo-200 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" /> Official Source Knowledge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Question Chips */}
        <div className="p-3 bg-slate-50 border-b border-slate-100 overflow-x-auto whitespace-nowrap flex space-x-2 no-scrollbar">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="inline-block px-2.5 py-1 text-xs bg-white text-slate-700 font-medium rounded-full border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all shrink-0 active:scale-95 shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2.5 ${
                m.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 whitespace-pre-line'
                }`}
              >
                {m.content}

                {/* Sources & Action Chips */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="font-semibold text-slate-500 block mb-1">Official Sources:</span>
                    <div className="space-y-1">
                      {m.sources.map((s, sIdx) => (
                        <a
                          key={sIdx}
                          href={s}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-indigo-600 hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 mr-1 shrink-0" />
                          <span className="truncate">{s}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                  U
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 animate-pulse">
              <Bot className="w-4 h-4 text-indigo-500" />
              <span>Checking verified official notices...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask when is registration, required docs..."
              className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center">
            <AlertCircle className="w-3 h-3 mr-1 text-amber-500" />
            Answers derived from official NTA, IIT, IIM & SSC notices.
          </p>
        </div>
      </div>
    </div>
  );
};
