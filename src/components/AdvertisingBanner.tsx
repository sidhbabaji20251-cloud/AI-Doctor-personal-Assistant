import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  PlusCircle,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  Building2,
  Pill,
  HeartHandshake,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AdvertisingCampaign, AdvertisingData } from '../types';
import { fetchAdvertising, submitCustomAdvertising } from '../services/api';

interface AdvertisingBannerProps {
  onNavigateTab?: (tab: string) => void;
  onOpenOwnerHub?: () => void;
}

export const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({
  onNavigateTab,
  onOpenOwnerHub,
}) => {
  const { language } = useApp();
  const isHindi = language === 'hi';

  const [campaigns, setCampaigns] = useState<AdvertisingCampaign[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form for custom ad
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adActionLabel, setAdActionLabel] = useState('Contact / Info');
  const [adActionUrl, setAdActionUrl] = useState('');
  const [adSponsor, setAdSponsor] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchAdvertising()
      .then((data: AdvertisingData) => {
        if (isMounted && data?.campaigns?.length > 0) {
          setCampaigns(data.campaigns);
        }
      })
      .catch(() => {
        // Fallback default campaign
        if (isMounted) {
          setCampaigns([
            {
              id: 'ad-default-owner',
              badge: 'OWNER FREEMIUM NOTICE',
              badgeHi: 'ओनर फ्रीवेयर सूचना',
              title: 'AI Doctor Personal Assistant — 100% Freeware by Owner',
              titleHi: 'एआई डॉक्टर पर्सनल असिस्टेंट — ओनर द्वारा 100% फ्रीवेयर',
              description:
                'Distributed directly by owner (sidhbabaji20251@gmail.com) via URL for clinical testing, Golwala prescriber reference, and healthcare advertising outreach.',
              descriptionHi:
                'ओनर (sidhbabaji20251@gmail.com) द्वारा क्लीनिकल टेस्टिंग, गोलवाला प्रिस्क्रिप्शन व विज्ञापन हेतु निःशुल्क वेब URL द्वारा वितरित।',
              actionLabel: 'Owner Details',
              actionLabelHi: 'ओनर विवरण',
              actionUrl: 'mailto:sidhbabaji20251@gmail.com',
              sponsorName: 'sidhbabaji20251@gmail.com',
              isOwnerPromo: true,
            },
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (isDismissed || campaigns.length === 0) {
    return null;
  }

  const currentAd = campaigns[currentIndex % campaigns.length];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const handleActionClick = (url: string) => {
    if (url.startsWith('#')) {
      const tabId = url.replace('#', '');
      if (onNavigateTab) onNavigateTab(tabId);
    } else if (url.startsWith('mailto:')) {
      window.location.href = url;
    } else if (url && url !== '#') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adTitle.trim() || !adDescription.trim()) return;

    try {
      const result = await submitCustomAdvertising({
        title: adTitle,
        description: adDescription,
        actionLabel: adActionLabel,
        actionUrl: adActionUrl,
        sponsorName: adSponsor || 'Owner Sponsor',
      });
      if (result.success && result.campaign) {
        setCampaigns((prev) => [result.campaign, ...prev]);
        setCurrentIndex(0);
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
          setShowCreateModal(false);
          setAdTitle('');
          setAdDescription('');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit ad:', err);
    }
  };

  return (
    <>
      <div className="mb-4 bg-amber-50 border border-amber-300 shadow-xs text-stone-900 transition-all">
        {/* Banner Top Strip */}
        <div className="bg-stone-900 text-amber-300 px-3 py-1 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-amber-200">
              {isHindi ? (currentAd.badgeHi || currentAd.badge) : currentAd.badge}
            </span>
            <span className="text-stone-400 hidden sm:inline">|</span>
            <span className="text-stone-300 text-[10px] hidden sm:inline">
              {isHindi ? 'हेल्थकेयर विज्ञापन व सूचना प्रसारण' : 'Integrated Healthcare & Medical Outreach Notice'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-amber-200/80 mr-1 hidden md:inline">
              {currentIndex + 1} of {campaigns.length}
            </span>
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white"
              title="Previous Notice"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-stone-800 text-stone-300 hover:text-white"
              title="Next Notice"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono text-[10px] flex items-center gap-1 ml-1"
              title="Test Custom Advertising"
            >
              <PlusCircle className="w-3 h-3" />
              <span className="hidden sm:inline">{isHindi ? 'विज्ञापन जोड़ें' : 'Test Custom Ad'}</span>
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-stone-400 hover:text-white hover:bg-stone-800 ml-1"
              title="Close Banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ad Body Content */}
        <div className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-amber-50 via-yellow-50/50 to-amber-100/60">
          <div className="space-y-1 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-stone-950">
                {isHindi ? (currentAd.titleHi || currentAd.title) : currentAd.title}
              </h4>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-stone-200 text-stone-800 border border-stone-300">
                {currentAd.sponsorName}
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {isHindi ? (currentAd.descriptionHi || currentAd.description) : currentAd.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleActionClick(currentAd.actionUrl)}
              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <span>{isHindi ? (currentAd.actionLabelHi || currentAd.actionLabel) : currentAd.actionLabel}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {onOpenOwnerHub && (
              <button
                onClick={onOpenOwnerHub}
                className="px-2.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 font-mono text-xs font-semibold"
                title="Share Freeware App"
              >
                {isHindi ? 'ओनर शेयर' : 'Owner Share'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal for Testing Custom Advertising */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#fefce8] border-2 border-stone-900 shadow-2xl max-w-lg w-full text-stone-900 font-sans">
            <div className="bg-stone-900 text-amber-300 p-3.5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">
                  {isHindi ? 'कस्टम विज्ञापन व क्लीनिकल नोटिस टेस्ट करें' : 'Test Custom Medical Advertising Notice'}
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAd} className="p-4 space-y-3 text-xs">
              <p className="text-stone-600 text-[11px]">
                {isHindi
                  ? 'ओनर द्वारा इस Freeware ऐप में विज्ञापन व आउटरीच बैनर का लाइव परीक्षण करने हेतु विवरण दर्ज करें:'
                  : 'Test broadcasting your custom clinical notice, conference CME, or hospital outreach banner:'}
              </p>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-stone-700 mb-1">
                  {isHindi ? 'विज्ञापन शीर्षक (Headline)' : 'Notice / Ad Title'} *
                </label>
                <input
                  type="text"
                  required
                  value={adTitle}
                  onChange={(e) => setAdTitle(e.target.value)}
                  placeholder="e.g. Free Cardiology Health Camp at SMS Hospital"
                  className="w-full bg-white border border-stone-300 p-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-stone-700 mb-1">
                  {isHindi ? 'विज्ञापन विवरण (Details / Description)' : 'Description / Promotional Text'} *
                </label>
                <textarea
                  required
                  rows={3}
                  value={adDescription}
                  onChange={(e) => setAdDescription(e.target.value)}
                  placeholder="e.g. Free ECG and blood pressure checkup for rural patients. Open 9 AM to 3 PM."
                  className="w-full bg-white border border-stone-300 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[10px] uppercase font-bold text-stone-700 mb-1">
                    {isHindi ? 'बटन लेबल' : 'Action Button Label'}
                  </label>
                  <input
                    type="text"
                    value={adActionLabel}
                    onChange={(e) => setAdActionLabel(e.target.value)}
                    placeholder="e.g. View Schedule"
                    className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase font-bold text-stone-700 mb-1">
                    {isHindi ? 'स्पॉन्सर / ओनर नाम' : 'Sponsor / Clinic Name'}
                  </label>
                  <input
                    type="text"
                    value={adSponsor}
                    onChange={(e) => setAdSponsor(e.target.value)}
                    placeholder="e.g. Dr. Yadav Clinic / Jan Aushadhi"
                    className="w-full bg-white border border-stone-300 p-1.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase font-bold text-stone-700 mb-1">
                  {isHindi ? 'टारगेट लिंक या टैब (#prescriptions, #drugs, url)' : 'Target Link / Internal Tab'}
                </label>
                <input
                  type="text"
                  value={adActionUrl}
                  onChange={(e) => setAdActionUrl(e.target.value)}
                  placeholder="#prescriptions or https://..."
                  className="w-full bg-white border border-stone-300 p-1.5 text-xs font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-stone-200">
                <span className="text-[11px] text-stone-500 font-mono">
                  {submitSuccess && (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {isHindi ? 'विज्ञापन सक्रिय हुआ!' : 'Custom ad published!'}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-3 py-1.5 bg-stone-200 text-stone-800 font-mono text-xs font-semibold"
                  >
                    {isHindi ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold"
                  >
                    {isHindi ? 'प्रकाशित करें' : 'Publish Ad'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
