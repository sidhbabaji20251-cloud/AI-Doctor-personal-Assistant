import React, { useState, useId } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  QrCode,
  Sparkles,
  ShieldCheck,
  Link2,
  ExternalLink,
  X,
  Stethoscope,
  Terminal,
  Megaphone,
  Mail,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface OwnerShareHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const OwnerShareHubModal: React.FC<OwnerShareHubModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  const { language } = useApp();
  const isHindi = language === 'hi';

  const defaultBaseUrl =
    typeof window !== 'undefined' && window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://ais-pre-2hkwtujqhst3gqnhtivnrb-236247641087.asia-southeast1.run.app';

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [customDoctor, setCustomDoctor] = useState('Dr. S. Sharma');
  const [customReg, setCustomReg] = useState('SMC-10492');
  const [selectedPresetTab, setSelectedPresetTab] = useState('prescriptions');
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  const getCustomUrl = () => {
    const params = new URLSearchParams();
    if (selectedPresetTab) params.set('tab', selectedPresetTab);
    if (customDoctor) params.set('doctor', customDoctor);
    if (customReg) params.set('reg', customReg);
    params.set('mode', 'freeware');
    params.set('owner', 'sidhbabaji');
    return `${defaultBaseUrl}?${params.toString()}`;
  };

  const standardUrl = `${defaultBaseUrl}?mode=freeware&source=owner`;
  const prescriberUrl = `${defaultBaseUrl}?tab=prescriptions&source=owner_freeware`;
  const apiTestUrl = `${defaultBaseUrl}?tab=api-test&mode=test`;
  const currentCustomUrl = getCustomUrl();

  const shareViaWhatsApp = (urlToShare: string, title: string) => {
    const message = `🩺 *AI Doctor Personal Assistant - Freeware Medical Prescriber & AI Assistant*\n\n` +
      `Shared by Owner for Clinical Testing, Golwala Prescriptions & Community Healthcare.\n` +
      `📌 *Access Free Web App:* ${urlToShare}\n\n` +
      `✨ *Features:*\n` +
      `• Golwala Standard Prescriptions (50+ Conditions)\n` +
      `• Clinical Letter Pad with Doctor Reg SMC, Symptoms, Diagnosis & Rx\n` +
      `• High-Resolution A4 PDF Download & WhatsApp PDF Share\n` +
      `• Integrated API for Testing & Healthcare Advertising\n` +
      `• Verified Updates: SMS Jaipur, IGMC Shimla, Tanda & Hamirpur\n\n` +
      `Owner Contact: sidhbabaji20251@gmail.com`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = (urlToShare: string) => {
    const subject = encodeURIComponent('AI Doctor Personal Assistant - Freeware Medical Prescriber & Clinical API');
    const body = encodeURIComponent(
      `Dear Colleague,\n\nHere is the official Freeware URL for AI Doctor Personal Assistant & Golwala Standard Prescriber:\n${urlToShare}\n\n` +
      `You can use it for clinical reference, testing the integrated API, generating prescription letter pads with SMC registration, and downloading A4 PDFs.\n\n` +
      `Distributed by owner for testing & educational evaluation.\nContact: sidhbabaji20251@gmail.com`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fefce8] border-2 border-stone-900 shadow-2xl max-w-2xl w-full my-6 text-stone-900 font-sans">
        {/* Header Bar */}
        <div className="bg-stone-900 text-amber-300 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-700 text-white border border-red-500">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg tracking-tight text-white">
                  {isHindi ? 'ओनर फ्रीवेयर URL शेयर हब' : 'Owner Freeware URL Distribution Hub'}
                </h2>
                <span className="px-2 py-0.5 bg-amber-400 text-stone-900 font-mono text-[10px] font-black uppercase tracking-wider">
                  100% Freeware
                </span>
              </div>
              <p className="text-xs text-amber-200/90 font-mono">
                {isHindi
                  ? 'ओनर द्वारा URL द्वारा भेजा जाने वाला अधिकृत फ्रीवेयर संस्करण'
                  : 'Sent exclusively by owner via authenticated Web URL for testing & advertising'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Owner License & Freeware Notice */}
          <div className="p-3.5 bg-amber-100 border border-amber-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isHindi
                  ? 'निःशुल्क फ्रीवेयर वितरण नीति (Owner Freeware License)'
                  : 'Official Freeware Distribution by Owner'}
              </span>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {isHindi
                ? 'यह ऐप ओनर (sidhbabaji20251@gmail.com) द्वारा निःशुल्क क्लीनिकल टेस्टिंग, गोलवाला प्रिस्क्रिप्शन संदर्भ, व मेडिकल विज्ञापन/आउटरीच के लिए एक सीधे वेब URL के रूप में साझा किया जाता है। कोई सब्सक्रिप्शन या छिपा हुआ शुल्क नहीं है।'
                : 'This application is distributed 100% free of charge by the owner (sidhbabaji20251@gmail.com) as a standalone Web URL for clinical testing, Golwala prescriber reference, and integrated healthcare advertising. No subscription or paywall required.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono text-stone-800">
              <span>Owner: <strong className="text-red-900">sidhbabaji20251@gmail.com</strong></span>
              <span>·</span>
              <span>Distribution: <strong>Owner URL Link</strong></span>
              <span>·</span>
              <span>Integrated API: <strong className="text-emerald-800">Ready for Testing</strong></span>
            </div>
          </div>

          {/* Quick Shareable URLs List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-red-700" />
              {isHindi ? 'त्वरित शेयर करने योग्य URL (1-क्लिक शेयर)' : 'Ready-to-Send Freeware URLs'}
            </h3>

            {/* Link 1: Complete App Main Freeware URL */}
            <div className="p-3 bg-white border border-stone-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  {isHindi ? 'मुख्य फ्रीवेयर वेब URL (संपूर्ण ऐप)' : 'Primary Freeware App URL'}
                </span>
                <span className="text-[10px] font-mono text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 border border-emerald-200">
                  Full Suite
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={standardUrl}
                  className="flex-1 bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-800 truncate"
                />
                <button
                  onClick={() => copyToClipboard(standardUrl, 'std')}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'std' ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'कॉपी' : 'Copy')}</span>
                </button>
                <button
                  onClick={() => shareViaWhatsApp(standardUrl, 'AI Doctor Personal Assistant')}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 title='Share on WhatsApp'"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Link 2: Direct Golwala Prescriptions & SMC Letter Pad Link */}
            <div className="p-3 bg-white border border-stone-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-red-700" />
                  {isHindi ? 'सीधा प्रिस्क्रिप्शन व SMC लेटर पैड लिंक' : 'Direct Golwala Prescriptions & SMC Pad'}
                </span>
                <span className="text-[10px] font-mono text-red-900 font-bold bg-red-50 px-1.5 py-0.5 border border-red-200">
                  50+ Conditions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={prescriberUrl}
                  className="flex-1 bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-800 truncate"
                />
                <button
                  onClick={() => copyToClipboard(prescriberUrl, 'rx')}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'rx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'rx' ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'कॉपी' : 'Copy')}</span>
                </button>
                <button
                  onClick={() => shareViaWhatsApp(prescriberUrl, 'Standard Prescriptions')}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Link 3: Integrated API Testing Suite Link */}
            <div className="p-3 bg-white border border-stone-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-stone-800" />
                  {isHindi ? 'इंटीग्रेटेड API टेस्टिंग व डायग्नोस्टिक्स लिंक' : 'Integrated API Testing & Diagnostics Link'}
                </span>
                <span className="text-[10px] font-mono text-stone-900 font-bold bg-amber-100 px-1.5 py-0.5 border border-amber-300">
                  Dev & Tester
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiTestUrl}
                  className="flex-1 bg-stone-50 border border-stone-300 px-2.5 py-1.5 text-xs font-mono text-stone-800 truncate"
                />
                <button
                  onClick={() => copyToClipboard(apiTestUrl, 'test')}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'test' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'test' ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'कॉपी' : 'Copy')}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    if (onNavigateTab) onNavigateTab('api-test');
                  }}
                  className="px-2.5 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-900 font-mono text-xs font-semibold shrink-0"
                >
                  {isHindi ? 'खोलें' : 'Open Test'}
                </button>
              </div>
            </div>
          </div>

          {/* Custom URL Builder for Owner */}
          <div className="p-4 bg-white border border-stone-300 space-y-3">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-700" />
              {isHindi ? 'कस्टम URL जनरेटर (डॉक्टर व क्लीनिक के लिए)' : 'Custom URL Builder (Tailored for Doctor / Clinic)'}
            </h3>
            <p className="text-[11px] text-stone-600">
              {isHindi
                ? 'ओनर द्वारा सहकर्मियों को भेजे जाने वाले लिंक में डॉक्टर का नाम, SMC रजिस्ट्रेशन व पसंदीदा टैब पहले से सेट करें:'
                : 'Pre-configure doctor credentials and landing view into the URL before sending to colleagues:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                  {isHindi ? 'डॉक्टर का नाम' : 'Doctor Name'}
                </label>
                <input
                  type="text"
                  value={customDoctor}
                  onChange={(e) => setCustomDoctor(e.target.value)}
                  placeholder="Dr. S. Sharma"
                  className="w-full bg-stone-50 border border-stone-300 px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                  {isHindi ? 'पंजीकरण (SMC)' : 'Doctor Reg (SMC)'}
                </label>
                <input
                  type="text"
                  value={customReg}
                  onChange={(e) => setCustomReg(e.target.value)}
                  placeholder="SMC-10492"
                  className="w-full bg-stone-50 border border-stone-300 px-2 py-1 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-stone-600 mb-1">
                  {isHindi ? 'लैंडिंग टैब' : 'Target Tab'}
                </label>
                <select
                  value={selectedPresetTab}
                  onChange={(e) => setSelectedPresetTab(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 px-2 py-1 text-xs"
                >
                  <option value="prescriptions">Standard Prescriptions</option>
                  <option value="drugs">Drug Substitutes</option>
                  <option value="api-test">Integrated API Testing</option>
                  <option value="institutes">Medical Colleges Notices</option>
                  <option value="dashboard">Dashboard</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentCustomUrl}
                className="flex-1 bg-stone-100 border border-stone-300 px-2.5 py-1.5 text-[11px] font-mono text-stone-900 truncate"
              />
              <button
                onClick={() => copyToClipboard(currentCustomUrl, 'custom')}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1 shrink-0"
              >
                {copiedKey === 'custom' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'custom' ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'कॉपी कस्टम URL' : 'Copy Custom URL')}</span>
              </button>
              <button
                onClick={() => shareViaWhatsApp(currentCustomUrl, customDoctor)}
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* QR Code & Direct Share Buttons */}
          <div className="p-4 bg-amber-50 border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-stone-800" />
                <span>{isHindi ? 'मोबाइल स्कैन व त्वरित शेयरिंग' : 'Mobile Scan & Multi-Channel Share'}</span>
              </div>
              <p className="text-[11px] text-stone-700 mt-0.5">
                {isHindi
                  ? 'ओपीडी या क्लीनिक में स्मार्टफोन से सीधे खोलने के लिए क्यूआर कोड दिखाएं या ईमेल करें।'
                  : 'Display QR code for instant camera scan or send to colleague groups via WhatsApp and Email.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowQr(!showQr)}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-50 font-mono text-xs font-semibold flex items-center gap-1.5 text-stone-800"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? (isHindi ? 'क्यूआर छिपाएं' : 'Hide QR') : (isHindi ? 'क्यूआर दिखाएं' : 'Show QR')}</span>
              </button>
              <button
                onClick={() => shareViaEmail(standardUrl)}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isHindi ? 'ईमेल भेजें' : 'Email'}</span>
              </button>
            </div>
          </div>

          {/* Visual QR Code Display */}
          {showQr && (
            <div className="p-4 bg-white border-2 border-dashed border-stone-400 flex flex-col items-center justify-center space-y-3">
              <div className="text-center">
                <div className="font-bold text-xs text-stone-900">
                  {isHindi ? 'मोबाइल से स्कैन करके खोलें' : 'Scan to Open Freeware App on Smartphone'}
                </div>
                <div className="text-[11px] text-stone-500 font-mono mt-0.5">
                  Point camera at this QR Code
                </div>
              </div>
              <div className="p-3 bg-white border border-stone-300 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(standardUrl)}`}
                  alt="AI Doctor Personal Assistant Freeware App QR Code"
                  className="w-44 h-44 object-contain"
                />
              </div>
              <div className="text-center font-mono text-[10px] text-stone-600 max-w-sm truncate">
                {standardUrl}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700 text-[11px]">
            <Megaphone className="w-4 h-4 text-red-700" />
            <span>
              {isHindi
                ? 'हेल्थकेयर विज्ञापन व टेस्टिंग API पूरी तरह सक्रिय है।'
                : 'Integrated Testing API & Healthcare Advertising active.'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
