import React, { useState } from 'react';
import { Search, ExternalLink, Check, Plus, BookOpen, Clock, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Exam } from '../types';

interface ExamCataloguePageProps {
  exams: Exam[];
  onSubscribe: (examId: number) => void;
  onUnsubscribe: (examId: number) => void;
  onSelectExam: (examId: number) => void;
}

const CATEGORIES = ["All", "Engineering", "Medical", "MBA", "Government Exams", "University"];

export const ExamCataloguePage: React.FC<ExamCataloguePageProps> = ({
  exams,
  onSubscribe,
  onUnsubscribe,
  onSelectExam,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExams = exams.filter((ex) => {
    const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.organizing_authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ex.description && ex.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Competitive Exam Catalogue
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Subscribe to national examinations to activate automated official website monitoring and instant deadline alerts.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exam, authority..."
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((ex) => (
          <div
            key={ex.id}
            className={`bg-white rounded-2xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between ${
              ex.is_subscribed ? 'border-indigo-200 ring-1 ring-indigo-500/20' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  {ex.category}
                </span>

                {ex.is_subscribed ? (
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3 mr-1" /> Subscribed
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Not Tracking</span>
                )}
              </div>

              <h3
                onClick={() => onSelectExam(ex.id)}
                className="text-base font-bold text-slate-900 mt-2.5 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                {ex.name}
              </h3>

              <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{ex.organizing_authority}</span>
              </div>

              <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                {ex.description}
              </p>

              {/* Official Portal Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <a
                  href={ex.official_website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-500 hover:text-indigo-600 flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span className="truncate max-w-[180px]">Official Portal</span>
                </a>

                {ex.days_remaining !== null && ex.days_remaining !== undefined && (
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                    {ex.days_remaining}d deadline
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => onSelectExam(ex.id)}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
              >
                Timeline & Notices
              </button>

              {ex.is_subscribed ? (
                <button
                  onClick={() => onUnsubscribe(ex.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                >
                  Unsubscribe
                </button>
              ) : (
                <button
                  onClick={() => onSubscribe(ex.id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center space-x-1 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
