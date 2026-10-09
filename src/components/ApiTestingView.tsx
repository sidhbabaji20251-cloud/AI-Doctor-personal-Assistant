import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Server,
  Cpu,
  Database,
  Code2,
  Copy,
  Check,
  Megaphone,
  Share2,
  Stethoscope,
  Pill,
  Building2,
  FileText,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ApiDiagnosticReport } from '../types';
import {
  fetchApiDiagnostics,
  runApiTestRunner,
  fetchStandardPrescriptions,
  fetchDrugSubstitutes,
  fetchMedicalInstitutes,
  fetchAdvertising,
  fetchFreewareInfo,
} from '../services/api';

interface ApiTestingViewProps {
  onOpenOwnerHub?: () => void;
}

export const ApiTestingView: React.FC<ApiTestingViewProps> = ({ onOpenOwnerHub }) => {
  const { language } = useApp();
  const isHindi = language === 'hi';

  const [diagnostics, setDiagnostics] = useState<ApiDiagnosticReport | null>(null);
  const [loadingDiag, setLoadingDiag] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('standard-prescriptions');
  const [presetQuery, setPresetQuery] = useState<string>('Type 2 Diabetes Mellitus');
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [testingEndpoint, setTestingEndpoint] = useState(false);
  const [runnerError, setRunnerError] = useState<string | null>(null);

  const loadDiagnostics = async () => {
    setLoadingDiag(true);
    try {
      const data = await fetchApiDiagnostics();
      setDiagnostics(data);
    } catch (err: any) {
      console.error('Failed to run diagnostics:', err);
    } finally {
      setLoadingDiag(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const executeApiTest = async () => {
    setTestingEndpoint(true);
    setRunnerError(null);
    setTestResponse(null);
    const start = performance.now();

    try {
      let result: any = null;
      if (selectedEndpoint === 'standard-prescriptions') {
        result = await fetchStandardPrescriptions('all', presetQuery, language);
      } else if (selectedEndpoint === 'drug-substitutes') {
        result = await fetchDrugSubstitutes(presetQuery || 'Amoxicillin and Clavulanic Acid', language);
      } else if (selectedEndpoint === 'medical-institutes') {
        result = await fetchMedicalInstitutes('all', language, presetQuery);
      } else if (selectedEndpoint === 'advertising') {
        result = await fetchAdvertising();
      } else if (selectedEndpoint === 'freeware-info') {
        result = await fetchFreewareInfo();
      } else if (selectedEndpoint === 'gemini-runner') {
        result = await runApiTestRunner('gemini', { prompt: presetQuery || 'Explain medical utility in 1 sentence.' });
      } else {
        result = await runApiTestRunner('health');
      }

      const elapsed = Math.round(performance.now() - start);
      setTestLatency(elapsed);
      setTestResponse(result);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - start);
      setTestLatency(elapsed);
      setRunnerError(err.message || 'API request failed');
    } finally {
      setTestingEndpoint(false);
    }
  };

  const getCurlSnippet = () => {
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:3000';
    if (selectedEndpoint === 'standard-prescriptions') {
      return `curl -X POST ${origin}/api/standard-prescriptions \\\n  -H "Content-Type: application/json" \\\n  -d '{"diseaseQuery": "${presetQuery}", "language": "en"}'`;
    }
    if (selectedEndpoint === 'drug-substitutes') {
      return `curl -X POST ${origin}/api/drug-substitutes \\\n  -H "Content-Type: application/json" \\\n  -d '{"saltQuery": "${presetQuery}", "language": "en"}'`;
    }
    if (selectedEndpoint === 'advertising') {
      return `curl -X GET ${origin}/api/advertising`;
    }
    if (selectedEndpoint === 'freeware-info') {
      return `curl -X GET ${origin}/api/freeware-info`;
    }
    return `curl -X GET ${origin}/api/test`;
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-stone-900 text-amber-300 p-4 sm:p-6 border-b-2 border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1 bg-red-700 text-white font-mono text-xs font-bold border border-red-500">
                API SUITE
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {isHindi ? 'इंटीग्रेटेड API टेस्टिंग व डायग्नोस्टिक्स' : 'Integrated API Testing & Diagnostics'}
              </h1>
              <span className="px-2 py-0.5 bg-amber-400 text-stone-950 font-mono text-[10px] font-black uppercase">
                Freeware Testing Mode
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-300">
              {isHindi
                ? 'ओनर द्वारा भेजे गए URL के लिए अंतर्निहित API एंडपॉइंट्स, जेमिनी 3.8, गोलवाला प्रिस्क्राइबर व विज्ञापन इंजन का लाइव परीक्षण।'
                : 'Direct in-app testing console for the integrated backend endpoints, Gemini 3.8 AI, Golwala database, and advertising broadcast.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadDiagnostics}
              disabled={loadingDiag}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-amber-200 border border-stone-700 font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loadingDiag ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'डायग्नोस्टिक्स रीफ्रेश' : 'Run Self-Test'}</span>
            </button>

            {onOpenOwnerHub && (
              <button
                onClick={onOpenOwnerHub}
                className="px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ओनर शेयर URL' : 'Owner Share URL'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Freeware & Owner Metadata Strip */}
        <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-stone-400 text-[10px] block">LICENSE & TIER</span>
            <span className="text-amber-300 font-bold">100% Freeware (Non-Commercial)</span>
          </div>
          <div>
            <span className="text-stone-400 text-[10px] block">DISTRIBUTED BY OWNER</span>
            <span className="text-white truncate block">sidhbabaji20251@gmail.com</span>
          </div>
          <div>
            <span className="text-stone-400 text-[10px] block">AI ENGINE & MODEL</span>
            <span className="text-emerald-400 font-bold">Gemini 3.8 Flash + Search Grounding</span>
          </div>
          <div>
            <span className="text-stone-400 text-[10px] block">STANDARD PRESCRIBER</span>
            <span className="text-amber-300 font-bold">Golwala 50+ Diseases + SMC Pad</span>
          </div>
        </div>
      </div>

      {/* Diagnostics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Server & Uptime */}
        <div className="bg-amber-50 border border-amber-300 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-600">
            <span className="flex items-center gap-1.5 font-bold text-stone-900">
              <Server className="w-4 h-4 text-stone-800" />
              <span>Server & Uptime</span>
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-[10px]">
              ONLINE
            </span>
          </div>
          <div className="text-lg font-mono font-bold text-stone-900">
            {diagnostics?.uptimeFormatted || 'Active'}
          </div>
          <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
            <div>Owner: sidhbabaji20251@gmail.com</div>
            <div>Mode: Freeware URL Distribution</div>
            <div>Region: Rajasthan & HP Optimization</div>
          </div>
        </div>

        {/* Card 2: AI & Clinical Engines */}
        <div className="bg-amber-50 border border-amber-300 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-600">
            <span className="flex items-center gap-1.5 font-bold text-stone-900">
              <Cpu className="w-4 h-4 text-red-700" />
              <span>Clinical Intelligence Engine</span>
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-900 font-bold border border-emerald-300 text-[10px]">
              ACTIVE
            </span>
          </div>
          <div className="text-sm font-bold text-stone-900">
            Golwala Prescriber & SMC Pad
          </div>
          <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
            <div>Standard Protocols: 50 Diseases (11 Depts)</div>
            <div>PDF Generator: High-Res A4 Vector</div>
            <div>WhatsApp Forwarding: Instant PDF</div>
          </div>
        </div>

        {/* Card 3: Healthcare Advertising & Outreach */}
        <div className="bg-amber-50 border border-amber-300 p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-stone-600">
            <span className="flex items-center gap-1.5 font-bold text-stone-900">
              <Megaphone className="w-4 h-4 text-amber-700" />
              <span>Advertising & Broadcast</span>
            </span>
            <span className="px-1.5 py-0.5 bg-amber-200 text-stone-900 font-bold border border-amber-400 text-[10px]">
              BROADCASTING
            </span>
          </div>
          <div className="text-sm font-bold text-stone-900">
            Multi-Campaign Outreach
          </div>
          <div className="text-[11px] text-stone-600 space-y-0.5 font-mono">
            <div>Active Campaigns: {diagnostics?.capabilities?.advertisingEngine?.activeCampaignsCount || 4} notices</div>
            <div>Custom Owner Ads: Supported</div>
            <div>SMC CMEs & Free Rural Camps</div>
          </div>
        </div>
      </div>

      {/* Diagnostic Checks Table */}
      {diagnostics && diagnostics.diagnosticChecks && (
        <div className="bg-white border border-stone-300 shadow-xs">
          <div className="bg-stone-100 border-b border-stone-300 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-xs uppercase font-mono text-stone-900">
                {isHindi ? 'सिस्टम डायग्नोस्टिक परिणाम' : 'Automated Diagnostic Self-Test Log'}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-stone-500">
              Tested at: {new Date(diagnostics.timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-[10px] font-mono uppercase text-stone-600">
                <tr>
                  <th className="p-2.5">Subsystem / Test Name</th>
                  <th className="p-2.5">Result</th>
                  <th className="p-2.5">Latency</th>
                  <th className="p-2.5">Operational Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {diagnostics.diagnosticChecks.map((chk, i) => (
                  <tr key={i} className="hover:bg-amber-50/50">
                    <td className="p-2.5 font-bold text-stone-900">{chk.testName}</td>
                    <td className="p-2.5 font-mono">
                      {chk.result === 'PASS' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> {chk.result}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-stone-600">{chk.latencyMs} ms</td>
                    <td className="p-2.5 text-stone-700">{chk.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive API Playground / Test Console */}
      <div className="bg-white border-2 border-stone-900 shadow-md">
        <div className="bg-stone-900 text-amber-300 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="font-bold text-sm tracking-tight text-white">
              {isHindi ? 'लाइव API टेस्ट कंसोल (प्लेग्राउंड)' : 'Live Integrated API Test Console & Playground'}
            </h2>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            HTTP POST / GET Testing
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-700 mb-1">
                {isHindi ? 'एंडपॉइंट चुनें' : 'Select API Endpoint'}
              </label>
              <select
                value={selectedEndpoint}
                onChange={(e) => {
                  setSelectedEndpoint(e.target.value);
                  if (e.target.value === 'standard-prescriptions') setPresetQuery('Type 2 Diabetes Mellitus');
                  else if (e.target.value === 'drug-substitutes') setPresetQuery('Amoxicillin and Clavulanic Acid');
                  else if (e.target.value === 'medical-institutes') setPresetQuery('SMS Medical College Jaipur');
                  else if (e.target.value === 'gemini-runner') setPresetQuery('Explain mechanism of Metformin');
                  else setPresetQuery('');
                }}
                className="w-full bg-stone-50 border border-stone-300 p-2 text-xs font-mono"
              >
                <option value="standard-prescriptions">/api/standard-prescriptions (Golwala Rx)</option>
                <option value="drug-substitutes">/api/drug-substitutes (Generic & Jan Aushadhi)</option>
                <option value="medical-institutes">/api/medical-institutes (Colleges & OPDs)</option>
                <option value="advertising">/api/advertising (Healthcare Notices)</option>
                <option value="freeware-info">/api/freeware-info (Freeware Manifest)</option>
                <option value="gemini-runner">/api/test/runner (Gemini 3.8 AI Bridge)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-mono uppercase font-bold text-stone-700 mb-1">
                {isHindi ? 'टेस्ट क्वेरी / पेलोड' : 'Test Query / Payload Argument'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={presetQuery}
                  onChange={(e) => setPresetQuery(e.target.value)}
                  placeholder="Enter query argument..."
                  className="flex-1 bg-stone-50 border border-stone-300 p-2 text-xs font-mono"
                />
                <button
                  onClick={executeApiTest}
                  disabled={testingEndpoint}
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${testingEndpoint ? 'animate-spin' : ''}`} />
                  <span>{testingEndpoint ? (isHindi ? 'चल रहा है...' : 'Running...') : (isHindi ? 'टेस्ट करें' : 'Send Request')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
            <span className="text-stone-500">{isHindi ? 'क्विक टेस्ट:' : 'Quick Presets:'}</span>
            <button
              onClick={() => {
                setSelectedEndpoint('standard-prescriptions');
                setPresetQuery('Essential Hypertension');
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-stone-800"
            >
              Rx: Hypertension
            </button>
            <button
              onClick={() => {
                setSelectedEndpoint('standard-prescriptions');
                setPresetQuery('Acute Bronchial Asthma');
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-stone-800"
            >
              Rx: Asthma
            </button>
            <button
              onClick={() => {
                setSelectedEndpoint('drug-substitutes');
                setPresetQuery('Paracetamol');
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-stone-800"
            >
              Substitutes: Paracetamol
            </button>
            <button
              onClick={() => {
                setSelectedEndpoint('advertising');
                setPresetQuery('');
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-stone-800"
            >
              Ads: All Campaigns
            </button>
            <button
              onClick={() => {
                setSelectedEndpoint('freeware-info');
                setPresetQuery('');
              }}
              className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-stone-800"
            >
              Freeware Manifest
            </button>
          </div>

          {/* Response Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-900">API Response:</span>
                {testLatency !== null && (
                  <span className="px-1.5 py-0.2 bg-stone-200 text-stone-800 border border-stone-300 text-[10px]">
                    Latency: {testLatency} ms
                  </span>
                )}
                {testResponse && (
                  <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 text-[10px]">
                    HTTP 200 OK
                  </span>
                )}
                {runnerError && (
                  <span className="px-1.5 py-0.2 bg-red-100 text-red-800 font-bold border border-red-300 text-[10px]">
                    ERROR
                  </span>
                )}
              </div>

              {testResponse && (
                <button
                  onClick={() => copyToClipboard(JSON.stringify(testResponse, null, 2), 'response')}
                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[10px] flex items-center gap-1 border border-stone-300"
                >
                  {copiedKey === 'response' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'response' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              )}
            </div>

            <div className="bg-stone-950 text-emerald-400 p-3.5 font-mono text-xs max-h-72 overflow-y-auto border border-stone-800 rounded-none shadow-inner">
              {testingEndpoint ? (
                <div className="flex items-center gap-2 text-amber-300">
                  <Zap className="w-4 h-4 animate-spin" />
                  <span>Executing integrated endpoint request...</span>
                </div>
              ) : runnerError ? (
                <div className="text-red-400">Error: {runnerError}</div>
              ) : testResponse ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(testResponse, null, 2)}</pre>
              ) : (
                <div className="text-stone-500 italic">
                  Click "Send Request" or select a quick preset to view the integrated live response.
                </div>
              )}
            </div>
          </div>

          {/* cURL & Code Integration Snippet */}
          <div className="pt-2 border-t border-stone-200 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>External cURL Command (Terminal / Script Testing)</span>
              </span>
              <button
                onClick={() => copyToClipboard(getCurlSnippet(), 'curl')}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono text-[10px] flex items-center gap-1 border border-stone-300"
              >
                {copiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-stone-900 text-stone-200 font-mono text-[11px] overflow-x-auto border border-stone-800">
              {getCurlSnippet()}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
