import React, { useState } from 'react';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  Check,
  Copy,
  Send,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  WifiOff,
  Zap,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BarcodeInstallCardProps {
  language: 'en' | 'hi';
  compact?: boolean;
}

export const BarcodeInstallCard: React.FC<BarcodeInstallCardProps> = ({
  language,
  compact = false,
}) => {
  const isHindi = language === 'hi';
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-2hkwtujqhst3gqnhtivnrb-236247641087.asia-southeast1.run.app';

  // Specific Android install trigger URL
  const androidInstallUrl = `${origin}?install=android&mode=pwa_install&source=barcode_scan`;

  // QR Code URL pointing directly to Android installation trigger
  const qrBarcodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&format=png&margin=10&data=${encodeURIComponent(
    androidInstallUrl
  )}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(androidInstallUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text =
      `📲 *Install AI Doctor Personal Assistant on Android Phone*\n\n` +
      `Scan the Barcode or tap this link to install the app directly on your Android phone:\n` +
      `👉 ${androidInstallUrl}\n\n` +
      `⚡ Features:\n` +
      `• 100% Offline Clinical Golwala Prescriptions\n` +
      `• SMC Outpatient Letter Pad with PDF Download\n` +
      `• No Play Store required · Direct 1-Tap PWA Install\n\n` +
      `Support: sidhbabaji20251@gmail.com`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
    }
  };

  if (compact) {
    return (
      <div className="bg-[#fefce8] border-2 border-stone-900 p-3 flex items-center gap-3 shadow-xs">
        <img
          src={qrBarcodeUrl}
          alt="Scan Barcode to Install Android App"
          className="w-16 h-16 object-contain bg-white border border-stone-300 p-0.5 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-stone-900 flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isHindi ? 'एंड्रॉयड फोन पर बारकोड स्कैन करें' : 'Scan Barcode on Android'}</span>
          </div>
          <div className="text-[10px] text-stone-600 truncate mt-0.5">
            {isHindi ? 'सीधा होम स्क्रीन पर ऐप इंस्टॉल करें (100% ऑफ़लाइन)' : 'Install direct to home screen for offline use'}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleWhatsAppShare}
              className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[10px] font-bold flex items-center gap-1"
            >
              <Send className="w-2.5 h-2.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-2 py-0.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-[10px] font-bold"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fefce8] border-2 border-stone-900 p-5 sm:p-6 shadow-md my-4 font-sans text-stone-900">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Side: Information & Steps */}
        <div className="flex-1 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-800 text-emerald-100 font-mono text-xs font-bold uppercase tracking-wider">
            <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
            <span>{isHindi ? 'एंड्रॉयड फोन डायरेक्ट इंस्टॉलेशन' : 'Android Phone Direct Installation'}</span>
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold text-stone-950 tracking-tight leading-snug">
            {isHindi
              ? 'बारकोड स्कैन करके अपने एंड्रॉयड फोन पर ऐप इंस्टॉल करें'
              : 'Scan Barcode on Phone to Install App on Android Device'}
          </h3>

          <p className="text-xs text-stone-700 leading-relaxed max-w-xl">
            {isHindi
              ? 'किसी भी एंड्रॉयड फोन के कैमरे, व्हाट्सएप या गूगल लेंस से यह बारकोड स्कैन करें। फोन में तुरंत ऐप इंस्टॉलेशन प्रॉम्प्ट खुलेगा और ऐप आपके फोन के होम स्क्रीन पर बिना ऐप स्टोर के इंस्टॉल हो जाएगी।'
              : 'Point any Android phone camera, Google Lens, or WhatsApp camera at this barcode. The browser will automatically open the one-tap installation prompt to install the app on your Android home screen.'}
          </p>

          {/* 3 Step Instruction Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-xs">
            <div className="p-2.5 bg-white border border-stone-300 space-y-0.5">
              <div className="font-bold text-red-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-red-700 text-white inline-flex items-center justify-center text-[10px]">1</span>
                <span>{isHindi ? 'स्कैन करें' : 'Scan Barcode'}</span>
              </div>
              <div className="text-[11px] text-stone-600">
                {isHindi ? 'फोन कैमरे से बारकोड स्कैन करें' : 'Point Android camera at QR barcode'}
              </div>
            </div>

            <div className="p-2.5 bg-white border border-stone-300 space-y-0.5">
              <div className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-emerald-700 text-white inline-flex items-center justify-center text-[10px]">2</span>
                <span>{isHindi ? 'इंस्टॉल टैप करें' : 'Tap Install'}</span>
              </div>
              <div className="text-[11px] text-stone-600">
                {isHindi ? '"Install App" प्रॉम्प्ट पर टैप करें' : 'Accept the "Install App" dialog'}
              </div>
            </div>

            <div className="p-2.5 bg-white border border-stone-300 space-y-0.5">
              <div className="font-bold text-stone-900 flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-stone-900 text-white inline-flex items-center justify-center text-[10px]">3</span>
                <span>{isHindi ? '100% ऑफ़लाइन' : '100% Offline'}</span>
              </div>
              <div className="text-[11px] text-stone-600">
                {isHindi ? 'पहाड़ों व दूरदराज में बिना नेट चलाएं' : 'Works offline with zero internet'}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isHindi ? 'व्हाट्सएप पर लिंक भेजें' : 'Send to Android via WhatsApp'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'इंस्टॉल लिंक कॉपी करें' : 'Copy Install Link')}</span>
            </button>

            {isInstallable && (
              <button
                onClick={handleDirectInstall}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse"
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                <span>{isHindi ? 'इसी फोन पर तुरंत इंस्टॉल करें' : 'Install on This Device Now'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: High-Visibility Barcode + Linear Barcode Badge */}
        <div className="bg-white p-4 border-2 border-stone-900 shadow-sm flex flex-col items-center text-center shrink-0 w-64">
          <div className="text-[11px] font-bold text-stone-900 font-mono uppercase tracking-wider mb-2 flex items-center gap-1">
            <QrCode className="w-3.5 h-3.5 text-red-700" />
            <span>{isHindi ? 'एंड्रॉयड इंस्टॉलेशन बारकोड' : 'Android Install Barcode'}</span>
          </div>

          {/* 2D QR Code */}
          <div className="p-2 bg-white border border-stone-300 shadow-xs mb-2">
            <img
              src={qrBarcodeUrl}
              alt="Scan Barcode to Install AI Doctor on Android"
              className="w-44 h-44 object-contain"
            />
          </div>

          {/* 1D Linear Barcode Graphic */}
          <div className="w-full py-1 px-2 bg-stone-50 border border-stone-200 mb-1">
            <div className="flex justify-between items-center h-5 px-2 overflow-hidden opacity-90">
              {/* Simulated barcode vertical bars */}
              {[4, 2, 6, 1, 3, 5, 2, 4, 1, 5, 3, 2, 6, 2, 4, 3, 1, 5, 2, 4, 6, 2, 3, 5, 1, 4, 2].map((w, i) => (
                <div
                  key={i}
                  className="bg-black h-full"
                  style={{ width: `${w}px`, marginRight: '1px' }}
                />
              ))}
            </div>
            <div className="text-[9px] font-mono text-stone-600 tracking-widest mt-0.5">
              *AIDOC-ANDROID-INSTALL*
            </div>
          </div>

          <div className="text-[10px] text-stone-500 font-mono mt-1">
            Android Chrome · Samsung · WhatsApp Lens
          </div>
        </div>
      </div>
    </div>
  );
};
