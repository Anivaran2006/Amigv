import React from 'react';
import { CheckCircle2, Clock, HelpCircle, AlertCircle, Calendar } from 'lucide-react';
import { TimelineStage } from '../types';

interface ExamTimelineProps {
  examName: string;
  stages: TimelineStage[];
}

export const ExamTimeline: React.FC<ExamTimelineProps> = ({ examName, stages }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
            AI Official Exam Timeline: {examName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status synchronized with official announcements.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span> Officially Announced
          </span>
          <span className="flex items-center text-slate-500">
            <span className="w-2 h-2 rounded-full bg-slate-300 mr-1.5"></span> Not Announced Yet
          </span>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute top-5 left-4 bottom-5 w-0.5 bg-slate-200" />

        <div className="space-y-6">
          {stages.map((stage, idx) => {
            const isAnnounced = stage.status === 'announced';
            return (
              <div key={idx} className="relative flex items-start pl-11 group">
                {/* Node icon */}
                <div
                  className={`absolute left-2 -translate-x-1/2 top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                    isAnnounced
                      ? 'bg-emerald-500 border-emerald-100 text-white shadow-sm'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                >
                  {isAnnounced ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <span className={`text-sm font-semibold ${isAnnounced ? 'text-slate-900' : 'text-slate-600'}`}>
                      {stage.stage}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 sm:mt-0 ${
                        isAnnounced
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {isAnnounced ? stage.date : 'Not announced yet'}
                    </span>
                  </div>
                  {isAnnounced && (
                    <p className="text-xs text-slate-500 mt-1">
                      Verified from the official authority announcement portal.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
        <span>
          <strong>ExamAlert AI Rule:</strong> Dates are only presented once confirmed by the organizing institute. We never fabricate or approximate dates.
        </span>
      </div>
    </div>
  );
};
