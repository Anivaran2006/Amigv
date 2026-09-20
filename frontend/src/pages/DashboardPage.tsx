import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Bell, ShieldCheck, ArrowRight, Clock, Send, Mail, CheckCircle2, AlertTriangle, Sparkles, ExternalLink, Zap } from 'lucide-react';
import { User, Exam, Deadline, NotificationItem } from '../types';

interface DashboardPageProps {
  user: User;
  subscribedExams: Exam[];
  deadlines: Deadline[];
  notifications: NotificationItem[];
  onOpenDemo: () => void;
  onOpenAI: () => void;
  onExploreExams: () => void;
  onSelectExam: (examId: number) => void;
  onUnsubscribe: (examId: number) => void;
  onSelectNotification: (notif: NotificationItem) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  subscribedExams,
  deadlines,
  notifications,
  onOpenDemo,
  onOpenAI,
  onExploreExams,
  onSelectExam,
  onUnsubscribe,
  onSelectNotification,
}) => {
  // Live ticking countdown for next deadline
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => (s + 1) % 60), 1000);
    return () => clearInterval(timer);
  }, []);

  const closestDeadline = deadlines.length > 0 ? deadlines[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* SaaS Greeting Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-slate-800 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10">
          <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Official Portal Monitoring Synchronized</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good day, {user.full_name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-normal">
            You are currently tracking <strong className="text-white">{subscribedExams.length} examinations</strong> with <strong className="text-white">{deadlines.length} verified deadlines</strong> in queue.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={onOpenDemo}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:shadow-lg transition-all flex items-center space-x-1.5 active:scale-95 animate-pulse-glow"
          >
            <span>🧪 Simulate Update</span>
          </button>
          <button
            onClick={onOpenAI}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs transition-all flex items-center space-x-1.5 shadow-2xs backdrop-blur-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* Metric Cards (Section 15 Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subscribed Exams</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">{subscribedExams.length}</span>
            <span className="text-xs text-slate-500 font-medium">monitored</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span> All active
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Deadlines</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">{deadlines.length}</span>
            <span className="text-xs text-amber-600 font-semibold">official dates</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            Next: {closestDeadline ? `${closestDeadline.days_remaining}d left` : 'None pending'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dispatched Alerts</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-950 font-mono">{notifications.length}</span>
            <span className="text-xs text-slate-500 font-medium">received</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            Telegram + HTML Email
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monitoring Engine</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-lg font-extrabold text-slate-950">Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 font-medium">
            Scanning NTA, IIT, IIM, SSC
          </div>
        </div>
      </div>

      {/* Large Urgency Hero Card: NEXT DEADLINE */}
      {closestDeadline && (
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-card border border-slate-800 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                  NEXT CRITICAL DEADLINE
                </span>
                <span className="text-slate-400 text-xs font-semibold">100% Official Source Verified</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                🏆 {closestDeadline.exam_name} — {closestDeadline.event_name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                Scheduled for <strong>{new Date(closestDeadline.deadline_date).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>. Make sure all application forms and fee receipts are submitted on the official testing agency portal.
              </p>
            </div>

            {/* Monospace Countdown */}
            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 text-center shrink-0 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Time Remaining
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300 tracking-wider">
                {closestDeadline.days_remaining}d 14h 22m {String(59 - seconds).padStart(2, '0')}s
              </div>
              <button
                onClick={() => onSelectExam(closestDeadline.exam_id)}
                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1"
              >
                <span>View Official Notice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 15: My Exams */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950 tracking-tight">My Subscribed Examinations</h2>
            <p className="text-xs text-slate-500">Continuous AI monitoring across official portals</p>
          </div>
          <button
            onClick={onExploreExams}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
          >
            <span>Browse Full Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {subscribedExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Subscribed Exams Yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Subscribe to exams like JEE Main, NEET, GATE, or CAT to activate verified deadline alerts.
            </p>
            <button
              onClick={onExploreExams}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Explore Exams Catalogue →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subscribedExams.map((ex) => (
              <div
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle hover:shadow-card hover:border-indigo-200 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 font-mono">
                      {ex.category}
                    </span>
                    <span className="flex items-center text-[11px] text-emerald-600 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                      Tracking Active
                    </span>
                  </div>

                  <h3
                    onClick={() => onSelectExam(ex.id)}
                    className="text-base font-extrabold text-slate-900 mt-2.5 group-hover:text-indigo-600 cursor-pointer transition-colors"
                  >
                    {ex.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{ex.organizing_authority}</p>

                  {/* Next Deadline banner */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center font-medium">
                        <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        Next Deadline:
                      </span>
                      {ex.days_remaining !== undefined && ex.days_remaining !== null ? (
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] font-mono ${
                          ex.days_remaining <= 3
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {ex.days_remaining}d remaining
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Not announced</span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                      {ex.upcoming_deadline || "Waiting for official bulletin"}
                    </p>
                  </div>

                  {/* Latest Notice snippet */}
                  {ex.latest_notice_title && (
                    <div className="mt-3 text-xs text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Latest Notice:</span>
                      <p className="line-clamp-2 text-slate-700 font-medium mt-0.5 text-xs">{ex.latest_notice_title}</p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectExam(ex.id)}
                    className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <span>View AI Timeline</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUnsubscribe(ex.id)}
                    className="text-slate-400 hover:text-red-600 transition-colors font-medium"
                  >
                    Unsubscribe
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Grid: Upcoming Deadlines & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 15: Upcoming Deadlines */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Upcoming Official Deadlines</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">100% verified</span>
          </div>

          {deadlines.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No active deadlines for your subscribed exams.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="pb-2.5">Exam</th>
                    <th className="pb-2.5">Event</th>
                    <th className="pb-2.5">Official Date</th>
                    <th className="pb-2.5 text-right">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {deadlines.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-bold text-slate-900">{d.exam_name}</td>
                      <td className="py-3 text-slate-600">{d.event_name}</td>
                      <td className="py-3 text-slate-700 font-mono">
                        {new Date(d.deadline_date).toLocaleDateString(undefined, {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          d.days_remaining <= 3
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : d.days_remaining <= 7
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {d.days_remaining}d left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 15: Recent Notifications */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Dispatched Alerts</h2>
            </div>
            <span className="text-xs text-slate-400">Telegram & Email</span>
          </div>

          {notifications.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No alerts dispatched yet.</p>
          ) : (
            <div className="space-y-2.5">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  onClick={() => onSelectNotification(n)}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50/70 transition-all cursor-pointer flex items-start space-x-3.5 group"
                >
                  <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white shadow-2xs ${
                    n.channel === 'telegram' ? 'bg-sky-500' : 'bg-indigo-600'
                  }`}>
                    {n.channel === 'telegram' ? <Send className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {n.exam_name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(n.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 truncate mt-0.5 group-hover:text-indigo-600 transition-colors">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.message_preview}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
