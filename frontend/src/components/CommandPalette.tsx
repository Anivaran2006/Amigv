import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Calendar, BookOpen, Bell, ArrowRight, X, Command } from 'lucide-react';
import { Exam } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  onSelectExam: (examId: number) => void;
  onNavigate: (view: string) => void;
  onOpenDemo: () => void;
  onOpenAI: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  exams,
  onSelectExam,
  onNavigate,
  onOpenDemo,
  onOpenAI,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredExams = exams.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase()) ||
      e.organizing_authority.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 space-x-3">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type an exam, category, or command..."
            className="w-full text-sm outline-none placeholder:text-slate-400 font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 rounded border border-slate-200">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 sm:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        {!query && (
          <div className="p-3 bg-slate-50/70 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  onClose();
                  onOpenDemo();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors text-left"
              >
                <span>🧪</span>
                <span>Simulate Exam Update</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenAI();
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 block">
            {query ? 'Matching Exams' : 'Monitored Examinations'}
          </span>

          {filteredExams.map((ex) => (
            <div
              key={ex.id}
              onClick={() => {
                onClose();
                onSelectExam(ex.id);
              }}
              className="px-3 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between cursor-pointer transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {ex.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {ex.name}
                  </div>
                  <div className="text-[11px] text-slate-400">{ex.organizing_authority}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                  {ex.category}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}

          {filteredExams.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-6">No matching examinations found.</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigate with click or arrow keys</span>
          <span>ExamAlert AI Command Engine</span>
        </div>
      </div>
    </div>
  );
};
