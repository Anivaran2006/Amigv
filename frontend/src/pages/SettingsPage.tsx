import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Send, ShieldCheck, CheckCircle2, Bell, AlertCircle, Save } from 'lucide-react';
import { User } from '../types';
import { api } from '../services/api';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser }) => {
  const [fullName, setFullName] = useState(user.full_name);
  const [phone, setPhone] = useState(user.phone || '');
  const [telegramChatId, setTelegramChatId] = useState(user.telegram_chat_id || '');
  const [notifyEmail, setNotifyEmail] = useState(user.notify_email);
  const [notifyTelegram, setNotifyTelegram] = useState(user.notify_telegram);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updated = await api.updateProfile({
        full_name: fullName,
        phone,
        telegram_chat_id: telegramChatId,
        notify_email: notifyEmail,
        notify_telegram: notifyTelegram
      });
      onUpdateUser(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Notification & Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure how and where you receive official deadline alerts and admit card notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <UserIcon className="w-4 h-4 text-indigo-600" />
            <span>Student Profile Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Email</label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-200 bg-slate-50 rounded-xl text-slate-400 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Account primary identifier</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Telegram Integration Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Send className="w-4 h-4 text-sky-500" />
              <span>Telegram Bot Integration</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-50 text-sky-700 border border-sky-200">
              High Urgency Channel
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Connect your Telegram account to receive instant push alerts the second an official notice is published by NTA, IIT, or SSC.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Telegram Chat ID or Username
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
                placeholder="e.g. 789012345 or @username"
                className="flex-1 px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Guide */}
          <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 space-y-1.5">
            <span className="font-bold block">How to find your Telegram Chat ID:</span>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-sky-800">
              <li>Open Telegram and search for <code>@userinfobot</code></li>
              <li>Tap <strong>Start</strong> to see your numerical User ID (e.g. <code>123456789</code>)</li>
              <li>Paste that ID above and enable Telegram alerts below!</li>
            </ol>
          </div>
        </div>

        {/* Notification Channel Preferences */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Bell className="w-4 h-4 text-indigo-600" />
            <span>Active Notification Channels</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-indigo-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Email Notifications</div>
                  <div className="text-[11px] text-slate-500">Receive verified HTML bulletins and deadline countdowns</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <Send className="w-5 h-5 text-sky-500" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Telegram Push Alerts</div>
                  <div className="text-[11px] text-slate-500">Real-time mobile broadcast alerts with action links</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={notifyTelegram}
                onChange={(e) => setNotifyTelegram(e.target.checked)}
                className="w-4 h-4 text-sky-500 rounded focus:ring-sky-400"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-2">
          {savedSuccess ? (
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Settings saved successfully!
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
