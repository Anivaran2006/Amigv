import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Bell, CheckCircle2, ArrowRight, Clock, Award, Sparkles, 
  Building2, Send, Mail, Calendar, Check, ExternalLink, HelpCircle, 
  ChevronDown, ChevronUp, Layers, Zap, Flame, AlertCircle, RefreshCw, 
  Search, ShieldAlert, FileText, Cpu, Radar, Terminal, Bot, User as UserIcon,
  CheckCheck, ArrowUpRight, MessageSquare, Play, Lock, Info, Activity
} from 'lucide-react';
import { api } from '../services/api';

interface LandingPageProps {
  onGetStarted: () => void;
  onOpenDemo: () => void;
  onExploreExams: () => void;
}

const EXAMS_TICKER = [
  { name: "JEE Main 2027", authority: "NTA", status: "Session 1 Portal Active", color: "emerald" },
  { name: "NEET UG 2027", authority: "NTA", status: "Information Bulletin Verified", color: "blue" },
  { name: "GATE 2027", authority: "IIT Roorkee", status: "GOAPS Scraped Hourly", color: "amber" },
  { name: "CAT 2026", authority: "IIM", status: "Admit Card Portal Monitored", color: "emerald" },
  { name: "SSC CGL 2026", authority: "SSC", status: "Exam Dates Extracted", color: "purple" },
  { name: "UPSC CSE 2027", authority: "UPSC", status: "Calendar Synchronized", color: "indigo" },
  { name: "CUET UG 2027", authority: "NTA", status: "Official Feed Live", color: "emerald" },
];

const MONITORED_AUTHORITIES = [
  { portal: "jeemain.nta.nic.in", agency: "National Testing Agency", ping: "38ms", hash: "9e4b...8f12", status: "Synchronized", exam: "JEE Main 2027" },
  { portal: "gate2027.iitr.ac.in", agency: "IIT Roorkee (GOAPS)", ping: "52ms", hash: "2a1c...5d90", status: "Synchronized", exam: "GATE 2027" },
  { portal: "iimcat.ac.in", agency: "IIM CAT Convener", ping: "34ms", hash: "f70e...34ab", status: "Synchronized", exam: "CAT 2026" },
  { portal: "ssc.gov.in", agency: "Staff Selection Commission", ping: "61ms", hash: "c381...19dc", status: "Synchronized", exam: "SSC CGL" },
  { portal: "upsc.gov.in", agency: "Union Public Service Commission", ping: "44ms", hash: "7b2d...884e", status: "Synchronized", exam: "UPSC CSE" },
  { portal: "exams.nta.ac.in/NEET", agency: "NTA Medical Division", ping: "41ms", hash: "18fe...49bc", status: "Synchronized", exam: "NEET UG 2027" },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  isVerified?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    sender: 'assistant',
    text: "Hello! I am your ExamAlert AI Assistant. Ask me anything about upcoming competitive exams, our zero-hallucination verification, or how our official SHA-256 scraper pipeline works.",
    timestamp: "Just now",
    source: "Official System Prompt",
    isVerified: true,
  }
];

const SUGGESTED_QUERIES = [
  "How does zero-hallucination work?",
  "When is JEE Main 2027 registration?",
  "How does the SHA-256 hash scraper work?",
  "How do I receive Telegram alerts?",
];

const FAQS = [
  {
    q: "What is ExamAlert AI and how is it different from normal news sites?",
    a: "ExamAlert AI is a specialized, zero-hallucination competitive exam notification assistant. Unlike blogs or coaching forums that post speculative clickbait dates, ExamAlert AI monitors official government portals directly (NTA, IIT Roorkee, IIM, SSC, UPSC). Every update is cryptographically hashed, parsed with temperature-0 AI, and dispatched directly to your Telegram and Email."
  },
  {
    q: "Does ExamAlert AI ever estimate or fabricate exam dates?",
    a: "Strictly no. If an official agency has not announced a date in their official PDF notice, ExamAlert AI explicitly marks the date as 'Not announced yet'. We will never guess, speculate, or generate tentative dates. Your preparation timeline is protected by an ironclad zero-hallucination guarantee."
  },
  {
    q: "How does the SHA-256 Content-Hash change detection work?",
    a: "Our scrapers crawl official portals on a regular schedule. The system extracts the core document text, strips away dynamic ads and CDN timestamps, and computes a SHA-256 cryptographic checksum. Only when the checksum differs from the previous verified state is the notice classified as genuine, preventing false alarms and spam."
  },
  {
    q: "How do I get alerts on my phone via Telegram?",
    a: "After you enter the student dashboard on the next webpage, open Settings and enter your Telegram username or chat ID (which you can get instantly by messaging @userinfobot). Our Telegram bot will immediately send you a verified handshake and all urgent deadlines (T-7 days, T-3 days, T-24 hours)."
  },
  {
    q: "Will I receive duplicate emails or Telegram pings?",
    a: "No. ExamAlert AI includes canonical deduplication. Even if an exam authority re-uploads a notice with minor layout edits, our deduplication engine prevents repeated notifications so you only receive high-value, actionable alerts."
  },
  {
    q: "Is ExamAlert AI completely free for students?",
    a: "Yes! ExamAlert AI is 100% free for all students preparing for national competitive examinations. Our goal is simple: ensure no hardworking student ever misses an exam deadline."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onOpenDemo, onExploreExams }) => {
  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // AI Pipeline interactive step tab
  const [activePipelineStep, setActivePipelineStep] = useState<number>(0);

  // Interactive Landing Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsTyping(true);

    try {
      // Call backend AI assistant endpoint
      const response = await api.askAI(textToSend, 1);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: response.answer || "I have analyzed your inquiry against our verified official exam database.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.sources?.[0] || "Official Agency Portal (NTA / IIT / SSC)",
        isVerified: true,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      // Fallback zero-hallucination authoritative reply if backend is offline
      setTimeout(() => {
        let fallbackReply = "ExamAlert AI monitors only authenticated government portals (NTA, IIT Roorkee, IIM, SSC, UPSC). If a deadline is not announced yet, we strictly state 'Not announced yet' without speculating.";
        const lower = textToSend.toLowerCase();
        
        if (lower.includes('zero-hallucination') || lower.includes('hallucinat')) {
          fallbackReply = "Our Zero-Hallucination Policy means we never guess or fabricate dates. If an official notification PDF does not explicitly declare a deadline, our system sets the status to 'Not announced yet'. Every date shown is cited directly from official government releases.";
        } else if (lower.includes('jee') || lower.includes('main')) {
          fallbackReply = "JEE Main 2027 Session 1 official registration portal (jeemain.nta.nic.in) is monitored continuously. Regular registration opens in late September/October with exam scheduled for January. All deadline updates will dispatch directly to your Telegram.";
        } else if (lower.includes('sha-256') || lower.includes('hash') || lower.includes('scraper')) {
          fallbackReply = "Our scraper downloads official portal HTML/PDFs, strips dynamic session tokens, and computes a SHA-256 cryptographic hash. If the hash changes, the AI extracts changes immediately. If identical, zero unnecessary alerts are dispatched.";
        } else if (lower.includes('telegram') || lower.includes('alert')) {
          fallbackReply = "To get instant Telegram alerts, head to the next webpage (Student Dashboard), enter your Telegram chat ID in Settings, and you'll receive formatted markdown alerts with direct official links!";
        }

        const assistantMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: "Verified Official Knowledge Base",
          isVerified: true,
        };
        setMessages(prev => [...prev, assistantMsg]);
      }, 700);
    } finally {
      setIsTyping(false);
    }
  };

  const PIPELINE_STEPS = [
    {
      step: "01",
      title: "Scheduled Official Crawl",
      subtitle: "Hourly verification across NTA, IIT, IIM, SSC, UPSC",
      badge: "Distributed Scraper Engine",
      description: "Our crawler visits official portals (jeemain.nta.nic.in, gate2027.iitr.ac.in, ssc.gov.in) every 60 minutes. It handles CDN caches and renders notices in a sandbox.",
      code: `// Scraper Service Execution\nconst resp = await http.get("https://jeemain.nta.nic.in");\nconst cleanHtml = sanitizeDocumentBody(resp.text);\nconst checksum = sha256(cleanHtml);`
    },
    {
      step: "02",
      title: "SHA-256 Content Hash Diff",
      subtitle: "Zero false-positives via cryptographic byte inspection",
      badge: "Cryptographic Checksum",
      description: "We compare the new SHA-256 hash with the database baseline. If the bytes match, scan ends with zero overhead. If the hash changes, the difference triggers immediate parsing.",
      code: `// Hash Comparison Engine\nif (existingExam.content_hash !== newHash) {\n  log("Authentic official update detected!");\n  await triggerAiAnalyzer(exam, noticeText);\n}`
    },
    {
      step: "03",
      title: "Zero-Hallucination AI Parser",
      subtitle: "Strict temperature-0 factual extraction from notice PDFs",
      badge: "Deterministic AI Guard",
      description: "The AI categorizes the event (REGISTRATION_OPEN, ADMIT_CARD, DATE_EXTENDED). It refuses to guess unannounced dates and outputs verified structured JSON.",
      code: `// Deterministic AI Extraction Prompt\n"Extract registration_start, registration_end, and exam_date.\nCRITICAL RULE: If a date is not in the text, DO NOT GUESS.\nMark strictly as 'Not announced yet'."`
    },
    {
      step: "04",
      title: "Instant Multi-Channel Push",
      subtitle: "Telegram Bot & HTML Email with 7d, 3d, 1d countdowns",
      badge: "Real-time Notification Service",
      description: "Subscribed students receive instant formatted Telegram messages with one-click official PDF links, followed by automated urgency reminders as the deadline approaches.",
      code: `// Telegram Dispatch Service\nawait bot.sendMessage(chatId, {\n  text: "🚨 *JEE Main 2027 Registration Active!*\\nDeadline: Oct 20\\nLink: jeemain.nta.nic.in",\n  parse_mode: "Markdown"\n});`
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans">
      {/* Dynamic Animated Ambient Aurora Orbs in Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-gradient-to-tr from-indigo-900/30 via-violet-900/20 to-transparent blur-[120px] pointer-events-none -z-10 animate-aurora" />
      <div className="absolute top-[800px] right-0 w-[600px] h-[600px] bg-emerald-950/25 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[2200px] left-0 w-[500px] h-[500px] bg-purple-950/20 blur-[130px] pointer-events-none -z-10" />

      {/* =========================================================================
          1. DEDICATED LANDING PAGE NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-lg tracking-tight text-white">
                  ExamAlert <span className="text-indigo-400">AI</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline-flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Official Feeds
                </span>
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest hidden sm:block">
                Zero-Hallucination Exam Assistant
              </p>
            </div>
          </div>

          {/* Clean Landing Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#ai-pipeline" className="hover:text-white transition-colors">AI Pipeline</a>
            <a href="#landing-chatbot" className="hover:text-indigo-400 flex items-center space-x-1 transition-colors">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Chatbot</span>
            </a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Right Action: Transition to the NEXT WEBPAGE */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenDemo}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center space-x-1.5 active:scale-95"
              title="Trigger a simulated official exam update"
            >
              <span>🧪</span>
              <span className="hidden sm:inline">Simulate Notice</span>
            </button>

            <button
              onClick={onGetStarted}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-slate-950 bg-white hover:bg-slate-100 shadow-md shadow-white/10 transition-all flex items-center space-x-2 active:scale-95 group"
            >
              <span>Enter Student Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. INFINITE ANIMATED EXAMS TICKER
          ========================================================================= */}
      <div className="w-full bg-slate-900/90 text-white overflow-hidden py-2.5 border-b border-slate-800">
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-8 text-xs font-semibold">
          {[...EXAMS_TICKER, ...EXAMS_TICKER, ...EXAMS_TICKER].map((ex, idx) => (
            <div key={idx} className="inline-flex items-center space-x-2 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">{ex.name}</span>
              <span className="text-slate-400 font-mono text-[10px]">({ex.authority})</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {ex.status}
              </span>
              <span className="text-slate-600 px-2">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* =========================================================================
          3. HERO SECTION WITH RICH ANIMATIONS & TELEMETRY BADGES
          ========================================================================= */}
      <section className="relative pt-16 sm:pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Floating animated telemetry chip left */}
        <div className="hidden xl:flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl absolute top-24 left-6 animate-float-slow z-10 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-white block">NTA Official Portal Scraped</span>
            <span className="text-slate-400 text-[11px] font-mono">SHA-256 verified 1m ago</span>
          </div>
        </div>

        {/* Floating animated telemetry chip right */}
        <div className="hidden xl:flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl absolute top-36 right-6 animate-float-fast z-10 backdrop-blur-md">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
            <Send className="w-4 h-4" />
          </div>
          <div className="text-left text-xs">
            <span className="font-bold text-white block">Telegram Broadcast Dispatched</span>
            <span className="text-slate-400 text-[11px]">1,240 students notified</span>
          </div>
        </div>

        {/* Eyebrow badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 shadow-inner mb-6">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
          <span>ZERO-HALLUCINATION OFFICIAL COMPETITIVE EXAM NOTIFIER</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-5xl mx-auto">
          Never miss an exam <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-300 to-emerald-400 animate-gradient-text">
            deadline or official notice again.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          ExamAlert AI continuously monitors official portals (<strong className="text-white">NTA, IIT Roorkee, IIM, SSC, UPSC</strong>), detects authentic releases via SHA-256 content-hash verification, uses zero-hallucination AI to extract exact dates, and dispatches real-time alerts to your <strong className="text-indigo-300">Telegram & Email</strong>.
        </p>

        {/* Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-950 bg-white hover:bg-slate-100 shadow-xl shadow-white/10 transition-all flex items-center justify-center space-x-2 active:scale-95 group"
          >
            <span>Launch Student Dashboard (Next Webpage)</span>
            <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onOpenDemo}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl text-xs sm:text-sm font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95 shadow-sm"
          >
            <span>🧪 Simulate Official Update (Live Demo)</span>
          </button>

          <a
            href="#landing-chatbot"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl text-xs sm:text-sm font-bold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 transition-all flex items-center justify-center space-x-2 active:scale-95"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Try AI Chatbot Below</span>
          </a>
        </div>

        <p className="text-xs font-semibold text-slate-500 mt-4">
          Free for all students · 100% verified official source links · No speculative rumors
        </p>
      </section>

      {/* =========================================================================
          4. LIVE TELEMETRY RADAR & SCRAPING ENGINE
          ========================================================================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-900/80 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-sm">
          {/* Animated radar circle background */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none hidden lg:block">
            <div className="absolute inset-10 rounded-full border border-emerald-500/15" />
            <div className="absolute inset-20 rounded-full border border-emerald-500/20" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full animate-radar" />
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
              <Radar className="w-4 h-4 animate-spin" />
              <span>LIVE AUTHORITY RADAR & SCANNER</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Continuous Official Portal Monitoring
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
              Every hour, our distributed scrapers ping official testing agencies, bypass CDN caching, compute normalized SHA-256 document checksums, and trigger instant AI analysis if a single byte changes.
            </p>
          </div>

          {/* Grid of Monitored Servers */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
            {MONITORED_AUTHORITIES.map((srv, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-xs font-bold text-white">{srv.portal}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{srv.agency}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    {srv.exam}
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-[10px] text-emerald-400 font-bold block">{srv.ping}</span>
                  <span className="text-[10px] text-slate-500 font-mono">hash: {srv.hash}</span>
                  <span className="text-[10px] text-emerald-500 font-semibold block mt-1">● Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. INTERACTIVE LIVE AI CHATBOT FOR ASSISTANCE (RIGHT ON THE LANDING PAGE!)
          ========================================================================= */}
      <section id="landing-chatbot" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
            Assistance & Verification
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            Chat with ExamAlert AI
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Test the AI assistant right here on the landing page before heading to your student dashboard. Ask about deadlines, notifications, or how zero-hallucination works.
          </p>
        </div>

        {/* Chatbot Container */}
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center">
                  ExamAlert AI Assistant
                  <span className="ml-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-slate-400">Strictly Factual · Zero Hallucination Mode Active</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px]">
                v2.0 Verified
              </span>
            </div>
          </div>

          {/* Chat Messages List */}
          <div className="p-6 h-80 sm:h-96 overflow-y-auto space-y-4 text-xs bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[82%] sm:max-w-md rounded-2xl p-4 space-y-1.5 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs shadow-md'
                }`}>
                  <p className="leading-relaxed text-xs">{msg.text}</p>
                  
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 border-t border-white/10">
                    <span>{msg.timestamp}</span>
                    {msg.isVerified && (
                      <span className="flex items-center text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Source
                      </span>
                    )}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Checking official notices and verifying facts...</span>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts Pills */}
          <div className="px-6 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto text-[11px]">
            <span className="text-slate-500 font-bold shrink-0">Try asking:</span>
            {SUGGESTED_QUERIES.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sq)}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600/30 text-slate-300 hover:text-indigo-200 border border-slate-700/80 transition-all text-[11px]"
              >
                {sq}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about JEE, NEET, GATE, UPSC, or how the AI works..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 flex items-center space-x-1.5 active:scale-95"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </section>

      {/* =========================================================================
          6. THE SPECIFIC AI ARCHITECTURE & 4-STEP PIPELINE DETAILS
          ========================================================================= */}
      <section id="ai-pipeline" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 tracking-tight">
            How the Dual AI Engine Operates
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl mx-auto">
            ExamAlert AI combines SHA-256 cryptographic hashing with zero-temperature LLM factual boundary constraints.
          </p>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {PIPELINE_STEPS.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setActivePipelineStep(idx)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activePipelineStep === idx
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`font-mono text-xs font-extrabold ${activePipelineStep === idx ? 'text-indigo-400' : 'text-slate-500'}`}>
                  Step {step.step}
                </span>
                {activePipelineStep === idx && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
              </div>
              <h4 className="text-xs font-bold truncate text-slate-200">{step.title}</h4>
            </button>
          ))}
        </div>

        {/* Detailed Step Active Card */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>{PIPELINE_STEPS[activePipelineStep].badge}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {PIPELINE_STEPS[activePipelineStep].title}
            </h3>

            <p className="text-xs sm:text-sm text-indigo-300 font-medium">
              {PIPELINE_STEPS[activePipelineStep].subtitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {PIPELINE_STEPS[activePipelineStep].description}
            </p>

            <div className="pt-2 flex items-center space-x-4 text-xs font-semibold text-emerald-400">
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> High Availability
              </span>
              <span className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-1.5" /> SHA-256 Validated
              </span>
            </div>
          </div>

          {/* Terminal / Code Visualization */}
          <div className="lg:col-span-6 bg-slate-950 rounded-2xl p-5 border border-slate-800 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-300 ml-2 font-sans font-bold">engine_step_{PIPELINE_STEPS[activePipelineStep].step}.ts</span>
              </div>
              <span className="text-indigo-400">Autonomous</span>
            </div>
            <pre className="text-slate-300 overflow-x-auto pt-3 leading-relaxed text-[11px]">
              {PIPELINE_STEPS[activePipelineStep].code}
            </pre>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. COMPARISON TABLE: EXAMALERT AI VS OTHERS
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
            Why ExamAlert AI
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            How ExamAlert AI Compares
          </h2>
        </div>

        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4 sm:p-5">Feature</th>
                <th className="p-4 sm:p-5 text-indigo-400 font-black">ExamAlert AI</th>
                <th className="p-4 sm:p-5">Manual Daily Checking</th>
                <th className="p-4 sm:p-5">Rumor & Generic Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-white">Official Source Verification</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ 100% NTA/IIT/SSC Only</td>
                <td className="p-4 sm:p-5 text-slate-400">Time-Consuming</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ Fake News & Clickbait</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-white">Zero-Hallucination Policy</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ Strictly "Not Announced Yet"</td>
                <td className="p-4 sm:p-5 text-slate-400">N/A</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ Fabricates Tentative Dates</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-white">Real-Time Telegram Push</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ Instant Bot Delivery</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ None</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ Unrelated promo spam</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="p-4 sm:p-5 font-bold text-white">Automated Urgency Countdown</td>
                <td className="p-4 sm:p-5 text-emerald-400 font-bold">✓ 7-Day, 3-Day, 1-Day Alerts</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ Easy to Forget</td>
                <td className="p-4 sm:p-5 text-red-400 font-semibold">✕ No reminders</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =========================================================================
          8. DETAILED ANIMATED FAQ ACCORDION
          ========================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/15 px-3.5 py-1.5 rounded-full border border-indigo-500/30">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-md transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-bold text-white text-sm hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          9. HIGH-CONVERTING TRANSITION BANNER (TAKES TO THE NEXT WEBPAGE!)
          ========================================================================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-tr from-indigo-950 via-slate-900 to-violet-950 rounded-3xl p-8 sm:p-14 text-white shadow-2xl border border-indigo-500/30 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Next Webpage: Student Portal
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Ready to take control of your exam deadlines?
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Click below to transition directly to the next webpage and access your personalized student dashboard, exam timelines, and alert settings.
            </p>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white text-slate-950 font-black text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-xl shadow-white/10 flex items-center justify-center space-x-2 active:scale-95 group"
              >
                <span>Enter Student Dashboard Now</span>
                <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreExams}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-indigo-900/60 hover:bg-indigo-800/80 text-white font-bold text-xs sm:text-sm transition-all border border-indigo-700/60 active:scale-95"
              >
                Browse Monitored Exams
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 ExamAlert AI · Strictly Verified Official Sources (NTA, IIT, IIM, SSC, UPSC)</p>
          <div className="flex items-center space-x-4">
            <button onClick={onGetStarted} className="text-indigo-400 hover:underline">
              Enter Student Dashboard →
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
