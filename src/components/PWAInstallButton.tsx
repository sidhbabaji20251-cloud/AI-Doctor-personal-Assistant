import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  language?: 'en' | 'hi';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ language = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  const isHindi = language === 'hi';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm transition-all animate-pulse duration-1000"
        title={isHindi ? 'ऑफ़लाइन उपयोग के लिए ऐप इंस्टॉल करें' : 'Install App for Offline Use in Remote Areas'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>{isHindi ? 'ऐप इंस्टॉल करें (ऑफ़लाइन)' : 'Install Offline App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setShowIOSGuide(!showIOSGuide)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-stone-800/80 hover:bg-stone-800 text-stone-200 border border-stone-700"
          title="Install on iOS"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{isHindi ? 'iOS इंस्टॉल' : 'Install (iOS)'}</span>
        </button>

        {showIOSGuide && (
          <div className="absolute right-0 mt-2 w-64 p-3 bg-stone-900 border border-stone-700 text-stone-100 rounded-xl shadow-2xl z-50 text-xs">
            <div className="flex justify-between items-center mb-1 font-bold text-emerald-400">
              <span>{isHindi ? 'होम स्क्रीन पर जोड़ें' : 'Add to Home Screen'}</span>
              <button onClick={() => setShowIOSGuide(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>
            <p className="text-stone-300 text-[11px] leading-relaxed">
              {isHindi
                ? 'Safari में नीचे "Share" बटन (⎋) दबाएं और फिर "Add to Home Screen" (+)'
                : 'Tap Safari Share icon (⎋) and select "Add to Home Screen" (+) to use offline in remote hills & deserts.'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
};
