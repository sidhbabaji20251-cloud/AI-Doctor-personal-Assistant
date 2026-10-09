import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Wrench,
  ShieldCheck,
  Cpu,
  HardDrive,
  Wifi,
  Sparkles,
  Terminal,
  Clock,
  HeartPulse,
} from 'lucide-react';
import {
  DiagnosticCheckItem,
  DiagnosticReport,
  AutoFixLogEntry,
  runDiagnostics,
  executeAutoFix,
} from '../utils/autoDiagnosticEngine';

interface AutoDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const AutoDiagnosticModal: React.FC<AutoDiagnosticModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isHindi = language === 'hi';
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [logs, setLogs] = useState<AutoFixLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');

  const startDiagnostics = async () => {
    setLoading(true);
    try {
      const rep = await runDiagnostics();
      setReport(rep);
    } catch (err) {
      console.error('Diagnostics failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutoFix = async () => {
    setRepairing(true);
    try {
      const { report: updatedReport, logs: updatedLogs } = await executeAutoFix();
      setReport(updatedReport);
      setLogs(prev => [...updatedLogs, ...prev]);
    } catch (err) {
      console.error('Auto-repair execution failed:', err);
    } finally {
      setRepairing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startDiagnostics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const score = report?.overallHealthScore ?? 100;
  const isAllHealthy = score >= 90;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fefce8] border-2 border-stone-900 shadow-2xl max-w-3xl w-full my-6 text-stone-900 font-sans animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="bg-stone-900 text-amber-300 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-red-700 text-yellow-300 flex items-center justify-center font-bold">
              <HeartPulse className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>{isHindi ? 'ऑटो-डायग्नोस्टिक्स व स्वचालित त्रुटि निवारण' : 'Auto-Diagnostics & Auto-Error Fixing'}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-600/90 text-white font-mono uppercase tracking-wider">
                  Self-Healing
                </span>
              </div>
              <div className="text-[11px] text-amber-300/80 font-mono">
                {isHindi
                  ? 'सिस्टम अखंडता, ऑफ़लाइन PWA कैश, SMC लेटर पैड व स्वतः-मरम्मत इंजन'
                  : 'System Integrity, Offline PWA Caches, SMC Outpatient Pad & Auto-Repair'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score & Health Summary Banner */}
        <div className="bg-stone-900/90 text-stone-100 px-6 py-4 border-b border-stone-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-black text-lg border-2 ${
                isAllHealthy
                  ? 'border-emerald-500 bg-emerald-950/60 text-emerald-400'
                  : 'border-amber-500 bg-amber-950/60 text-amber-400'
              }`}
            >
              <span>{loading ? '...' : `${score}%`}</span>
              <span className="text-[9px] font-mono tracking-tighter uppercase font-medium">Health</span>
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                {isAllHealthy ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">
                      {isHindi ? 'समस्त क्लीनिकल व ऑफ़लाइन सिस्टम स्वस्थ हैं' : 'All Clinical & Offline Subsystems Operational'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">
                      {isHindi ? 'सुधार योग्य चेतावनियाँ खोजी गईं' : 'Auto-Recoverable Items Detected'}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-stone-300 font-mono mt-0.5">
                {report
                  ? `${report.items.filter(i => i.status === 'healthy').length}/${report.items.length} checks passed · Last evaluated: ${report.timestamp}`
                  : 'Initializing health probe...'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={startDiagnostics}
              disabled={loading || repairing}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'पुनः जांचें' : 'Re-Diagnose'}</span>
            </button>
            <button
              onClick={handleRunAutoFix}
              disabled={repairing || loading}
              className="px-3.5 py-1.5 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 animate-pulse"
            >
              <Wrench className={`w-3.5 h-3.5 ${repairing ? 'animate-spin text-yellow-300' : ''}`} />
              <span>
                {repairing
                  ? (isHindi ? 'मरम्मत जारी...' : 'Auto-Healing...')
                  : (isHindi ? '1-क्लिक स्वतः मरम्मत (Auto-Fix)' : '1-Click Auto-Fix & Self-Heal')}
              </span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="bg-stone-100 px-6 pt-3 border-b border-stone-300 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-red-700 text-red-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            {isHindi ? 'डायग्नोस्टिक अवलोकन' : 'Diagnostics Checklist'}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'border-red-700 text-red-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isHindi ? 'ऑटो-फिक्स लॉग्स' : 'Auto-Heal Audit Logs'}</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white rounded-full text-[10px]">
                {logs.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {report?.items.map(item => {
                const isHealthy = item.status === 'healthy';
                const isWarning = item.status === 'warning';
                const isError = item.status === 'error';
                const isChecking = item.status === 'checking';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 border transition-all ${
                      isHealthy
                        ? 'bg-white border-stone-300 hover:border-emerald-500'
                        : isWarning
                        ? 'bg-amber-50/70 border-amber-300'
                        : 'bg-red-50/70 border-red-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {item.category === 'network' && <Wifi className="w-4 h-4 text-stone-600" />}
                        {item.category === 'cache' && <HardDrive className="w-4 h-4 text-stone-600" />}
                        {item.category === 'storage' && <Cpu className="w-4 h-4 text-stone-600" />}
                        {item.category === 'clinical' && <ShieldCheck className="w-4 h-4 text-stone-600" />}
                        {item.category === 'pdf' && <Activity className="w-4 h-4 text-stone-600" />}
                        {item.category === 'audio' && <HeartPulse className="w-4 h-4 text-stone-600" />}
                        <span className="font-bold text-xs text-stone-900">
                          {isHindi ? item.nameHi : item.name}
                        </span>
                      </div>
                      <div>
                        {isChecking && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-stone-500">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Checking...
                          </span>
                        )}
                        {isHealthy && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            PASS
                          </span>
                        )}
                        {isWarning && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 font-bold">
                            <AlertTriangle className="w-3 h-3" />
                            ATTN
                          </span>
                        )}
                        {isError && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-red-700 bg-red-100 px-2 py-0.5 font-bold">
                            <XCircle className="w-3 h-3" />
                            FAIL
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-600 mt-1 leading-snug">
                      {item.description}
                    </div>

                    {item.details && (
                      <div className="mt-2.5 p-2 bg-stone-50 border border-stone-200 text-[11px] font-mono text-stone-700 leading-tight">
                        {item.details}
                      </div>
                    )}

                    {(!isHealthy && item.autoFixAvailable) && (
                      <div className="mt-2.5 pt-2 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[10px] text-amber-800 font-mono font-medium">
                          {isHindi ? 'स्वतः सुधार उपलब्ध' : 'Self-Heal Available'}
                        </span>
                        <button
                          onClick={() => handleRunAutoFix()}
                          disabled={repairing}
                          className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-yellow-300 text-[10px] font-mono font-bold flex items-center gap-1"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>{item.autoFixLabel || 'Auto-Fix'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-stone-500 font-mono text-xs">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <div>No auto-repair interventions recorded in this session.</div>
                  <div className="text-[11px] text-stone-400 mt-1">
                    Click "1-Click Auto-Fix & Self-Heal" above to run autonomous integrity calibration.
                  </div>
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white border border-stone-300 font-mono text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-stone-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                        SUCCESSFULLY REPAIRED
                      </span>
                    </div>
                    <div className="font-bold text-stone-900">
                      {log.actionTaken}
                    </div>
                    <div className="text-[11px] text-stone-600">
                      {log.details}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Autonomous Watchdog Footnote */}
          <div className="p-3 bg-amber-50 border border-amber-300/80 text-[11px] text-amber-900 font-mono flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">
                {isHindi ? 'सक्रिय स्वायत्त वॉचडॉग (Autonomous Error Watchdog): ' : 'Active Autonomous Error Watchdog: '}
              </span>
              <span>
                {isHindi
                  ? 'ऐप पृष्ठभूमि में चलने वाली किसी भी अपवाद या नेटवर्क ड्रॉप का पता लगाकर स्वतः डेटा रिकवरी और सर्विस वर्कर कैश को पुनर्स्थापित करता है ताकि रिमोट क्लीनिक में ऐप कभी क्रैश न हो।'
                  : 'The background runtime watchdog intercepts unhandled promise rejections, isolates corrupted local schemas, and hot-repairs offline PWA caches to prevent application crashes in remote Rajasthan & Himachal OPDs.'}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>AI Doctor Autonomous Self-Repair v2.5.0 · 100% Freeware</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-xs transition-colors"
          >
            {isHindi ? 'बंद करें' : 'Close Diagnostics'}
          </button>
        </div>
      </div>
    </div>
  );
};
