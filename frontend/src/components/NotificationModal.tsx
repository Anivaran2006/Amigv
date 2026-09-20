import React from 'react';
import { X, Send, Mail, CheckCircle2, ExternalLink, Calendar, AlertTriangle } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  notification: NotificationItem | null;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ notification, onClose }) => {
  if (!notification) return null;

  const isTelegram = notification.channel === 'telegram';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${isTelegram ? 'bg-sky-500' : 'bg-indigo-600'}`}>
              {isTelegram ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isTelegram ? 'Telegram Message Preview' : 'Official Email Dispatch Preview'}
              </h3>
              <p className="text-xs text-slate-500">
                Delivered via {notification.channel.toUpperCase()} · {new Date(notification.sent_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {isTelegram ? (
            /* Telegram Chat Style */
            <div className="bg-[#e7ebf0] p-4 rounded-xl border border-slate-300">
              <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-200 text-xs font-semibold text-sky-800">
                <Send className="w-3.5 h-3.5" />
                <span>ExamAlertBot Verified Official Broadcast</span>
              </div>
              <div className="bg-white rounded-xl rounded-tl-none p-4 shadow-sm text-slate-800 text-sm leading-relaxed whitespace-pre-line border border-slate-100">
                {notification.message_preview}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center text-sky-600 font-medium">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Official Source Verified
                  </span>
                  <span>{new Date(notification.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓</span>
                </div>
              </div>
            </div>
          ) : (
            /* Professional Email Style */
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white p-4">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded">
                  Official Alert
                </span>
                <h4 className="text-base font-bold mt-1">{notification.title}</h4>
                <p className="text-xs text-slate-300 mt-0.5">To: Student Mailbox · From: notifications@examalert.ai</p>
              </div>
              <div className="p-4 bg-white text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {notification.message_preview}
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Always review final instructions on the official testing agency portal before submitting fees.</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
              Status: Delivered & Duplicate Prevention Active
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
