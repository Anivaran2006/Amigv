import React, { useEffect, useState } from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck, Calendar, Check, Plus, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { api } from '../services/api';
import { Exam, Notice, TimelineStage } from '../types';
import { ExamTimeline } from '../components/ExamTimeline';

interface ExamDetailPageProps {
  examId: number;
  onBack: () => void;
  onSubscribe: (examId: number) => void;
  onUnsubscribe: (examId: number) => void;
  isSubscribed: boolean;
}

export const ExamDetailPage: React.FC<ExamDetailPageProps> = ({
  examId,
  onBack,
  onSubscribe,
  onUnsubscribe,
  isSubscribed,
}) => {
  const [data, setData] = useState<{
    exam: Exam;
    timeline: TimelineStage[];
    notices: Notice[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.getExamDetail(examId);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [examId]);

  if (loading || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        Loading official examination intelligence...
      </div>
    );
  }

  const { exam, timeline, notices } = data;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        <span>Back to All Exams</span>
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                {exam.category}
              </span>
              <span className="flex items-center text-xs text-emerald-600 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Monitored Official Authority
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              {exam.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Conducted by {exam.organizing_authority}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {isSubscribed ? (
              <button
                onClick={() => onUnsubscribe(exam.id)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
              >
                Unsubscribe
              </button>
            ) : (
              <button
                onClick={() => onSubscribe(exam.id)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all flex items-center space-x-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Subscribe for Alerts</span>
              </button>
            )}

            <a
              href={exam.official_website}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center space-x-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Official Website</span>
            </a>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100 leading-relaxed">
          {exam.description}
        </p>
      </div>

      {/* Section 16: AI Exam Timeline */}
      <ExamTimeline examName={exam.name} stages={timeline} />

      {/* Official Notices Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Extracted Official Notices & Bulletins</h2>
          </div>
          <span className="text-xs text-slate-400">Strict zero-hallucination extraction</span>
        </div>

        {notices.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-dashed border-slate-200 text-xs text-slate-400">
            No public notices scanned yet for this examination.
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div
                key={n.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {n.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400">
                      Published: {n.published_date || "Official Notice"}
                    </span>
                  </div>

                  <a
                    href={n.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center space-x-1"
                  >
                    <span>View on Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <h3 className="text-base font-bold text-slate-900">{n.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{n.summary}</p>

                {/* Structured Extraction Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl text-xs border border-slate-100">
                  {n.registration_start && n.registration_start !== "Not specified in the official notice." && (
                    <div>
                      <span className="font-semibold text-slate-400 block">Registration Period:</span>
                      <span className="font-medium text-slate-800">{n.registration_start} to {n.registration_end}</span>
                    </div>
                  )}

                  {n.exam_date && n.exam_date !== "Not specified in the official notice." && (
                    <div>
                      <span className="font-semibold text-slate-400 block">Exam Date:</span>
                      <span className="font-medium text-slate-800">{n.exam_date}</span>
                    </div>
                  )}

                  <div className="col-span-1 sm:col-span-2">
                    <span className="font-semibold text-slate-400 block">Required Action:</span>
                    <span className="font-medium text-slate-800">{n.action_required}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
