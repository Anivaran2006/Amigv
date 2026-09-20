import React from 'react';
import { Bell, ShieldAlert, Sparkles, LogOut, CheckCircle2, Search, Command } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenDemo: () => void;
  onOpenAI: () => void;
  onOpenCommand: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  user,
  onOpenAuth,
  onLogout,
  onOpenDemo,
  onOpenAI,
  onOpenCommand,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentView(user ? 'dashboard' : 'landing')} 
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg text-slate-950 tracking-tight">ExamAlert <span className="text-indigo-600">AI</span></span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" /> Official Verification
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:block">Never Miss an Exam Deadline</p>
            </div>
          </div>

          {/* Quick Search / Command Palette Bar */}
          <button
            onClick={onOpenCommand}
            className="hidden md:flex items-center space-x-3 px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200 text-slate-400 hover:text-slate-600 transition-all text-xs w-64 justify-between group shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              <span className="text-slate-500 font-medium">Search exams, notices...</span>
            </div>
            <kbd className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 bg-white rounded border border-slate-200 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {user ? (
              <>
                <button
                  onClick={() => setCurrentView('landing')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'landing'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Landing Page
                </button>
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'dashboard'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setCurrentView('exams')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'exams'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Exam Catalogue
                </button>
                <button
                  onClick={() => setCurrentView('notifications')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'notifications'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Alerts History
                </button>
                <button
                  onClick={() => setCurrentView('settings')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    currentView === 'settings'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                  }`}
                >
                  Settings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCurrentView('landing')}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Product
                </button>
                <button
                  onClick={() => setCurrentView('exams')}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Monitored Exams
                </button>
              </>
            )}
          </nav>

          {/* Actions & User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Hackathon Simulation Mode CTA */}
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md shadow-amber-200/50 hover:shadow-lg transition-all active:scale-95 animate-pulse-glow"
              title="Trigger a simulated official exam update to view live pipeline"
            >
              <span className="mr-1.5">🧪</span>
              <span className="hidden sm:inline">Simulate Update</span>
              <span className="sm:hidden">Simulate</span>
            </button>

            {/* What Should I Do? AI Assistant Button */}
            <button
              onClick={onOpenAI}
              className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              <span className="hidden md:inline">Ask AI Assistant</span>
              <span className="md:hidden">Ask AI</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                {/* Notifications Bell */}
                <button
                  onClick={() => setCurrentView('notifications')}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  )}
                </button>

                {/* User avatar & logout */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center text-xs font-bold uppercase shadow-2xs">
                    {user.full_name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 hidden xl:inline max-w-[100px] truncate">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuth}
                  className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-100 transition-all active:scale-95"
                >
                  Get Started Free
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
