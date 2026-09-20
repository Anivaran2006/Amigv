import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, Send, Mail, RefreshCw, Layers } from 'lucide-react';
import { api } from '../services/api';

interface DemoSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_NOTICES = [
  {
    exam_id: 1, // JEE Main
    title: "Public Notice: Session 1 Online Application Form Live",
    content: "The National Testing Agency (NTA) is officially inviting Online Applications for Joint Entrance Examination (Main) - 2027 Session 1. The registration window is active from 22 September to 22 October 2026 up to 11:50 PM. Candidates can apply on jeemain.nta.nic.in.",
    official_url: "https://jeemain.nta.nic.in",
    event_type: "REGISTRATION_OPEN"
  },
  {
    exam_id: 3, // GATE 2027
    title: "Announcement: GATE 2027 Application Form Correction Window",
    content: "The Organizing Institute IIT Roorkee announces the opening of the GOAPS correction window for GATE 2027 from 10 October to 15 October 2026. Candidates may rectify gender, category, and exam city preferences.",
    official_url: "https://gate2027.iitr.ac.in",
    event_type: "APPLICATION_CORRECTION"
  },
  {
    exam_id: 4, // CAT 2026
    title: "Official Notice: CAT 2026 Admit Card Download Commenced",
    content: "Indian Institutes of Management (IIM) announces that registered candidates for CAT 2026 can download their Admit Cards from the official website iimcat.ac.in starting today until 29 November 2026.",
    official_url: "https://iimcat.ac.in",
    event_type: "ADMIT_CARD"
  },
  {
    exam_id: 5, // SSC CGL
    title: "Staff Selection Commission Notice: CGL Tier-I Examination Schedule",
    content: "The Staff Selection Commission has scheduled the Combined Graduate Level Examination (Tier-I), 2026 between 14 October and 24 October 2026. City intimation slips will be released 10 days prior.",
    official_url: "https://ssc.gov.in",
    event_type: "EXAM_DATE"
  }
];

export const DemoSimulatorModal: React.FC<DemoSimulatorModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [examId, setExamId] = useState(PRESET_NOTICES[0].exam_id);
  const [title, setTitle] = useState(PRESET_NOTICES[0].title);
  const [content, setContent] = useState(PRESET_NOTICES[0].content);
  const [url, setUrl] = useState(PRESET_NOTICES[0].official_url);

  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESET_NOTICES[idx];
    setExamId(p.exam_id);
    setTitle(p.title);
    setContent(p.content);
    setUrl(p.official_url);
    setSimulationResult(null);
  };

  const handleExecutePipeline = async () => {
    setIsExecuting(true);
    setCurrentStep(1);
    setSimulationResult(null);

    // Visual animated delay through the 5 architectural steps
    setTimeout(() => setCurrentStep(2), 600);
    setTimeout(() => setCurrentStep(3), 1200);
    setTimeout(() => setCurrentStep(4), 1800);

    try {
      const res = await api.simulateExamUpdate({
        exam_id: examId,
        notice_title: title,
        notice_content: content,
        official_url: url
      });

      setTimeout(() => {
        setCurrentStep(5);
        setSimulationResult(res);
        setIsExecuting(false);
        onSuccess();
      }, 2300);
    } catch (err: any) {
      setIsExecuting(false);
      alert("Simulation error: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl">🧪</span>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold tracking-tight">Hackathon Simulation Mode</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white tracking-wider">
                  Live Engine Demo
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Demonstrates the complete official monitoring, AI extraction, and multi-channel dispatch pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Choose a Simulated Official Exam Notice:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PRESET_NOTICES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                  selectedPreset === idx
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 shadow-sm font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className="font-semibold text-slate-900 truncate">{p.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center justify-between">
                  <span>{p.event_type}</span>
                  <span className="text-indigo-600 font-medium">Preset #{idx + 1}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Notice Form Fields */}
        <div className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Notice Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Notice Body / Website Content</label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Official Source URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-lg text-slate-600"
            />
          </div>

          {/* Pipeline Step Progress Visualizer */}
          <div className="mt-4 p-4 rounded-xl bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5" /> End-to-End Pipeline Execution
              </span>
              <span className="text-[11px] text-slate-400">
                {isExecuting ? 'Processing...' : simulationResult ? 'Completed' : 'Ready'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className={`flex items-center space-x-2.5 ${currentStep >= 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>1</span>
                <span>1. Modular Scraper: Monitored Official Exam Portal</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${currentStep >= 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>2</span>
                <span>2. Change Detector: SHA-256 Content Hash Diff Detected</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${currentStep >= 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>3</span>
                <span>3. AI Notice Analyzer: Classified Event & Extracted Dates (Zero Hallucination)</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${currentStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 4 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>4</span>
                <span>4. Duplicate Prevention: Checked Subscriber Dispatch History</span>
              </div>
              <div className={`flex items-center space-x-2.5 ${currentStep >= 5 ? 'text-emerald-400' : 'text-slate-500'}`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${currentStep >= 5 ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'}`}>5</span>
                <span>5. Personalized Dispatch: Telegram Alert + HTML Email Sent to Subscribed Students!</span>
              </div>
            </div>
          </div>

          {/* Result Card */}
          {simulationResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-900 animate-fade-in">
              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{simulationResult.message}</span>
              </div>

              <div className="mt-2 text-xs grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-emerald-100">
                <div>
                  <span className="text-slate-400 font-semibold block">Event Type:</span>
                  <span className="font-bold text-indigo-700">{simulationResult.analysis.event_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Importance:</span>
                  <span className="font-bold text-red-600 uppercase">{simulationResult.analysis.importance}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 font-semibold block">Action Required:</span>
                  <span className="text-slate-800">{simulationResult.analysis.action_required}</span>
                </div>
              </div>

              {simulationResult.notifications_sent && simulationResult.notifications_sent.length > 0 && (
                <div className="mt-2 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Delivered Alerts:</span>
                  <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                    {simulationResult.notifications_sent.map((n: any, idx: number) => (
                      <li key={idx}>
                        {n.user} ({n.channel}) — <span className="text-emerald-700 font-medium">Delivered</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Close
          </button>
          <button
            onClick={handleExecutePipeline}
            disabled={isExecuting}
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isExecuting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" />
                Executing Pipeline...
              </>
            ) : (
              <>
                <span>Execute Live Monitoring Pipeline</span>
                <ArrowRight className="w-3.5 h-3.5 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
