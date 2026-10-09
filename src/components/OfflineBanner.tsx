import React, { useEffect, useState } from 'react';

interface OfflineBannerProps {
  language?: 'en' | 'hi';
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ language = 'en' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const isHindi = language === 'hi';

  if (isOnline && !showReconnected) {
    return null;
  }

  if (showReconnected) {
    return (
      <div className="bg-emerald-600 text-white text-xs px-4 py-1.5 flex items-center justify-center gap-2 shadow-sm transition-all duration-300">
        <span className="w-2 h-2 rounded-full bg-emerald-200 animate-ping" />
        <span className="font-medium">
          {isHindi
            ? '✓ इंटरनेट कनेक्शन पुनः सक्रिय हो गया (Online)'
            : '✓ Back online! Live data and regional intelligence synced.'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 text-amber-50 text-xs px-4 py-2 flex items-center justify-between shadow-md border-b border-amber-700/50">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-amber-200 flex-shrink-0 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-5.657-2.607m0 0l2.829-2.829m-2.829 2.829L3 21m2.828-12.536a5 5 0 017.072 0m-7.072 0L3 3" />
        </svg>
        <span className="font-medium">
          {isHindi
            ? 'ऑफ़लाइन मोड (दूरस्थ क्षेत्र / सीमित नेटवर्क): गोलवाला स्टैंडर्ड पर्चे व जेनेरिक दवाएं कैश्ड हैं।'
            : 'Offline Mode (Remote Area Network): Golwala standard prescriptions and cached medical data remain fully accessible.'}
        </span>
      </div>
      <span className="text-[10px] bg-amber-800/80 uppercase px-2 py-0.5 rounded font-bold tracking-wider text-amber-200">
        {isHindi ? 'कैश से संचालित' : 'Cache Active'}
      </span>
    </div>
  );
};
