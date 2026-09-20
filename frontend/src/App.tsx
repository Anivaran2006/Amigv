import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExamCataloguePage } from './pages/ExamCataloguePage';
import { ExamDetailPage } from './pages/ExamDetailPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthModal } from './pages/AuthModal';
import { DemoSimulatorModal } from './components/DemoSimulatorModal';
import { AIAssistantDrawer } from './components/AIAssistantDrawer';
import { NotificationModal } from './components/NotificationModal';
import { CommandPalette } from './components/CommandPalette';
import { FloatingChatbot } from './components/FloatingChatbot';
import { api } from './services/api';
import { User, Exam, Deadline, NotificationItem } from './types';
import { CheckCircle2 } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);

  // Data states
  const [exams, setExams] = useState<Exam[]>([]);
  const [subscribedExams, setSubscribedExams] = useState<Exam[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<NotificationItem | null>(null);

  // Banner / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Initial Load: Check local session (keeps landing page as initial showcase)
  useEffect(() => {
    const savedUser = localStorage.getItem("examalert_user");
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        setUser(u);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 2. Fetch data whenever user changes or on view switch
  const loadData = async () => {
    try {
      const allExams = await api.getExams(undefined, undefined, user?.id);
      setExams(allExams);

      if (user) {
        const myExams = await api.getMyExams();
        setSubscribedExams(myExams);

        const dl = await api.getDeadlines(user.id);
        setDeadlines(dl);

        const notifs = await api.getNotifications(user.id);
        setNotifications(notifs);
      } else {
        const dl = await api.getDeadlines(undefined, true);
        setDeadlines(dl);
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, currentView]);

  // Auth Handlers
  const handleAuthSuccess = (authUser: User) => {
    setUser(authUser);
    setCurrentView('dashboard');
    showToast(`Welcome, ${authUser.full_name}! Real-time exam monitoring is active.`);
    loadData();
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setCurrentView('landing');
    showToast("Signed out successfully.");
  };

  // Subscription Handlers
  const handleSubscribe = async (examId: number) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await api.subscribe(examId);
      showToast(res.message || "Subscribed! Official confirmation dispatched.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to subscribe");
    }
  };

  const handleUnsubscribe = async (examId: number) => {
    if (!user) return;
    try {
      const res = await api.unsubscribe(examId);
      showToast(res.message || "Unsubscribed from alerts.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to unsubscribe");
    }
  };

  const handleSelectExam = (examId: number) => {
    setSelectedExamId(examId);
    setCurrentView('exam-detail');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center space-x-2.5 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation - Only show when NOT on the standalone Landing Showcase */}
      {currentView !== 'landing' && (
        <Navbar
          currentView={currentView}
          setCurrentView={setCurrentView}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenAI={() => setIsAIOpen(true)}
          onOpenCommand={() => setIsCommandOpen(true)}
          unreadCount={notifications.length}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onGetStarted={() => {
              if (user) {
                setCurrentView('dashboard');
              } else {
                // If not logged in, auto-seed with verified student profile for instant seamless entry to next webpage
                const demoStudent: User = {
                  id: 1,
                  email: "anivaran@example.com",
                  full_name: "Anivaran Sharma",
                  telegram_chat_id: "7829104",
                  notify_email: true,
                  notify_telegram: true,
                  created_at: new Date().toISOString()
                };
                setUser(demoStudent);
                localStorage.setItem("examalert_user", JSON.stringify(demoStudent));
                setCurrentView('dashboard');
                showToast("Welcome to your ExamAlert AI Student Portal!");
              }
            }}
            onOpenDemo={() => setIsDemoOpen(true)}
            onExploreExams={() => {
              if (!user) {
                const demoStudent: User = {
                  id: 1,
                  email: "anivaran@example.com",
                  full_name: "Anivaran Sharma",
                  telegram_chat_id: "7829104",
                  notify_email: true,
                  notify_telegram: true,
                  created_at: new Date().toISOString()
                };
                setUser(demoStudent);
                localStorage.setItem("examalert_user", JSON.stringify(demoStudent));
              }
              setCurrentView('exams');
            }}
          />
        )}

        {currentView === 'dashboard' && user && (
          <DashboardPage
            user={user}
            subscribedExams={subscribedExams}
            deadlines={deadlines}
            notifications={notifications}
            onOpenDemo={() => setIsDemoOpen(true)}
            onOpenAI={() => setIsAIOpen(true)}
            onExploreExams={() => setCurrentView('exams')}
            onSelectExam={handleSelectExam}
            onUnsubscribe={handleUnsubscribe}
            onSelectNotification={(n) => setPreviewNotification(n)}
          />
        )}

        {currentView === 'exams' && (
          <ExamCataloguePage
            exams={exams}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
            onSelectExam={handleSelectExam}
          />
        )}

        {currentView === 'exam-detail' && selectedExamId && (
          <ExamDetailPage
            examId={selectedExamId}
            onBack={() => setCurrentView('exams')}
            onSubscribe={handleSubscribe}
            onUnsubscribe={handleUnsubscribe}
            isSubscribed={subscribedExams.some((e) => e.id === selectedExamId)}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsPage
            notifications={notifications}
            onSelectNotification={(n) => setPreviewNotification(n)}
            onRefresh={loadData}
          />
        )}

        {currentView === 'settings' && user && (
          <SettingsPage
            user={user}
            onUpdateUser={(updated) => {
              setUser(updated);
              showToast("Profile settings updated!");
            }}
          />
        )}
      </main>

      {/* Footer - Only show inside app views since Landing has its own footer */}
      {currentView !== 'landing' && (
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 ExamAlert AI · Never Miss an Exam Deadline</p>
            <div className="flex items-center space-x-4">
              <button onClick={() => setCurrentView('landing')} className="text-indigo-600 font-semibold hover:underline">
                ← Back to Landing Showcase
              </button>
              <span className="text-slate-400">Strictly Verified Official Sources (NTA, IIT, IIM, SSC, UPSC)</span>
            </div>
          </div>
        </footer>
      )}

      {/* Modals & Drawers */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <DemoSimulatorModal
        isOpen={isDemoOpen}
        onClose={() => setIsDemoOpen(false)}
        onSuccess={() => {
          showToast("Simulation completed! Check the new alert in Notifications.");
          loadData();
        }}
      />

      <AIAssistantDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        userId={user?.id || 1}
      />

      <NotificationModal
        notification={previewNotification}
        onClose={() => setPreviewNotification(null)}
      />

      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        exams={exams}
        onSelectExam={handleSelectExam}
        onNavigate={(view) => setCurrentView(view)}
        onOpenDemo={() => setIsDemoOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Floating AI Assistant Chatbot Widget */}
      <FloatingChatbot
        onNavigateToApp={() => {
          if (user) setCurrentView('dashboard');
          else setIsAuthOpen(true);
        }}
      />
    </div>
  );
}

export default App;
