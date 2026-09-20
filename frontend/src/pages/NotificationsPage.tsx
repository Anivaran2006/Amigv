import React, { useState } from 'react';
import { Bell, Send, Mail, CheckCircle2, Clock, Eye, Sparkles } from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  onSelectNotification: (notif: NotificationItem) => void;
  onRefresh: () => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onSelectNotification,
  onRefresh,
}) => {
  const [channelFilter, setChannelFilter] = useState<'all' | 'telegram' | 'email'>('all');
  const [testing, setTesting] = useState(false);

  const filtered = notifications.filter(
    (n) => channelFilter === 'all' || n.channel === channelFilter
  );

  const handleSendTestAlert = async () => {
    setTesting(true);
    try {
      await api.sendTestNotification();
      alert("✅ Test alerts dispatched to your active channels! Check the list below.");
      onRefresh();
    } catch (err: any) {
      alert("Error sending test notification: " + err.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notification & Alert History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Personalized alerts dispatched via Telegram Bot & HTML Email with duplicate prevention.
          </p>
        </div>

        <button
          onClick={handleSendTestAlert}
          disabled={testing}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 self-start active:scale-95 disabled:opacity-50"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{testing ? 'Sending Test...' : 'Send Test Notification'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setChannelFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            channelFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Channels ({notifications.length})
        </button>
        <button
          onClick={() => setChannelFilter('telegram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
            channelFilter === 'telegram' ? 'bg-sky-500 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Telegram ({notifications.filter((n) => n.channel === 'telegram').length})</span>
        </button>
        <button
          onClick={() => setChannelFilter('email')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
            channelFilter === 'email' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email ({notifications.filter((n) => n.channel === 'email').length})</span>
        </button>
      </div>

      {/* List of Notifications */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No Notifications in this Channel</h3>
          <p className="text-xs text-slate-400 mt-1">
            Trigger a simulated update or send a test notification above to verify message delivery.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notif) => {
            const isTelegram = notif.channel === 'telegram';
            return (
              <div
                key={notif.id}
                onClick={() => onSelectNotification(notif)}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 mt-0.5 ${
                      isTelegram ? 'bg-sky-500' : 'bg-indigo-600'
                    }`}
                  >
                    {isTelegram ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {notif.exam_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isTelegram
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        }`}
                      >
                        {isTelegram ? 'Telegram' : 'HTML Email'}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{notif.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{notif.message_preview}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0 text-xs text-slate-400 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(notif.sent_at).toLocaleString()}</span>
                  </div>

                  <button className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
