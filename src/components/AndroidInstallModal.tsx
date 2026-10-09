import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Download,
  Sparkles,
  CheckCircle2,
  Zap,
  ShieldCheck,
  WifiOff,
  MoreVertical,
  ArrowDown,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const isHindi = language === 'hi';
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      const outcome = await install();
      if (outcome) {
        setInstalledSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.warn('Install trigger note:', err);
    } finally {
      setInstalling(false);
    }
  };

  if (!isOpen || isInstalled) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#fefce8] border-2 border-stone-900 shadow-2xl max-w-lg w-full my-6 text-stone-900 font-sans">
        {/* Header Bar */}
        <div className="bg-emerald-800 text-white p-4 border-b border-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-none flex items-center justify-center font-bold text-white shadow-xs">
              <Smartphone className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>{isHindi ? 'एंड्रॉयड फोन पर ऐप इंस्टॉल करें' : 'Install App on Android Phone'}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-yellow-400 text-stone-950 font-mono font-bold uppercase tracking-wider">
                  Android WebAPK
                </span>
              </div>
              <div className="text-[11px] text-emerald-100 font-mono">
                {isHindi ? 'बारकोड स्कैन से जुड़ा डायरेक्ट इंस्टॉलेशन' : 'Direct Installation Initiated via Barcode Scan'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center border-2 border-emerald-600">
              <Smartphone className="w-8 h-8 text-emerald-700 animate-bounce" />
            </div>
            <h3 className="font-extrabold text-lg text-stone-900">
              {isHindi
                ? 'AI Doctor Personal Assistant को एंड्रॉयड होम स्क्रीन पर जोड़ें'
                : 'Add AI Doctor Personal Assistant to Android Home Screen'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              {isHindi
                ? 'बारकोड स्कैन करने के बाद आप इस ऐप को अपने फोन में एक पूर्ण नेटिव ऐप की तरह बिना प्ले स्टोर डाउनलोड किए इंस्टॉल कर सकते हैं।'
                : 'Scanned from barcode. Install this application on your Android phone as a native WebAPK with full offline capabilities.'}
            </p>
          </div>

          {/* Benefits Cards */}
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2.5 bg-white border border-stone-300 flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{isHindi ? '100% ऑफ़लाइन कार्य' : '100% Offline Access'}</span>
            </div>
            <div className="p-2.5 bg-white border border-stone-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{isHindi ? 'तुरंत लोड (Zero Lag)' : 'Instant 1-Tap OPD'}</span>
            </div>
            <div className="p-2.5 bg-white border border-stone-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-700 shrink-0" />
              <span>{isHindi ? 'SMC पर्चा व A4 PDF' : 'SMC Letter Pad'}</span>
            </div>
            <div className="p-2.5 bg-white border border-stone-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-700 shrink-0" />
              <span>{isHindi ? 'बिना प्ले स्टोर शुल्क' : 'Zero Play Store Fee'}</span>
            </div>
          </div>

          {/* Primary Action Button */}
          {installedSuccess ? (
            <div className="p-4 bg-emerald-100 border border-emerald-600 text-emerald-900 text-center font-mono text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>{isHindi ? 'ऐप सफलतापूर्वक इंस्टॉल हो गया!' : 'App Installed on Android Phone!'}</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              disabled={installing}
              className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-mono font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all animate-pulse"
            >
              <Download className="w-5 h-5 text-yellow-300" />
              <span>
                {installing
                  ? (isHindi ? 'इंस्टॉल किया जा रहा है...' : 'Installing...')
                  : (isHindi ? '1-टैप: एंड्रॉयड फोन पर इंस्टॉल करें' : '1-Tap: Install on Android Phone')}
              </span>
            </button>
          ) : (
            /* Fallback Chrome 3-dot step guide if native event already fired */
            <div className="p-3.5 bg-stone-100 border border-stone-300 space-y-2 text-xs">
              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                <MoreVertical className="w-4 h-4 text-stone-700" />
                <span>{isHindi ? 'Chrome ब्राउज़र में इंस्टॉल करने का तरीका:' : 'Android Chrome Menu Installation:'}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-stone-700 font-mono text-[11px] leading-relaxed">
                <li>
                  {isHindi
                    ? 'ब्राउज़र के ऊपर दाईं ओर 3 डॉट्स (⋮) मेन्यू पर टैप करें।'
                    : 'Tap the 3 dots (⋮) menu in the top-right corner of Chrome.'}
                </li>
                <li>
                  {isHindi
                    ? 'मेन्यू में "Install app" या "Add to Home screen" चुनें।'
                    : 'Select "Install app" or "Add to Home screen".'}
                </li>
                <li>
                  {isHindi
                    ? '"Install" पर टैप करें — ऐप सीधे फोन के ऐप ड्रॉअर में आ जाएगी।'
                    : 'Tap "Install" — the app is saved to your Android launcher.'}
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-300 flex items-center justify-between text-xs">
          <div className="text-[11px] text-stone-500 font-mono">
            {isHindi ? 'रिमोट क्लीनिक व OPD हेतु डिज़ाइन' : 'Engineered for Remote Clinics & OPD'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-xs"
          >
            {isHindi ? 'बाद में' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  );
};
