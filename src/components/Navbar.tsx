import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PWAInstallButton } from './PWAInstallButton';
import {
  LayoutDashboard,
  Newspaper,
  Building2,
  Microscope,
  Sparkles,
  ShoppingBag,
  CalendarCheck,
  Bookmark,
  Sliders,
  Languages,
  Menu,
  X,
  ShieldCheck,
  Stethoscope,
  Pill,
  ClipboardList,
  Terminal,
  Share2,
  HeartPulse,
  ScanLine,
  Smartphone,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenOwnerHub?: () => void;
  onOpenDiagnostics?: () => void;
  onOpenBarcodeTransfer?: () => void;
  onOpenAndroidInstall?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenOwnerHub,
  onOpenDiagnostics,
  onOpenBarcodeTransfer,
  onOpenAndroidInstall,
}) => {
  const { language, setLanguage, reminders, bookmarks } = useApp();
  const isHindi = language === 'hi';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeRemindersCount = reminders.filter(r => !r.completed).length;

  const navItems = [
    { id: 'dashboard', labelEn: 'Dashboard', labelHi: 'डैशबोर्ड', icon: LayoutDashboard },
    { id: 'prescriptions', labelEn: 'Standard Prescription', labelHi: 'स्टैंडर्ड प्रिस्क्रिप्शन', icon: ClipboardList },
    { id: 'drugs', labelEn: 'Drug and substitute:', labelHi: 'ड्रग व सब्स्टीट्यूट', icon: Pill },
    { id: 'doctors', labelEn: 'Doctors News', labelHi: 'डॉक्टर्स न्यूज़', icon: Stethoscope },
    { id: 'news', labelEn: 'Daily News', labelHi: 'दैनिक समाचार', icon: Newspaper },
    { id: 'institutes', labelEn: 'Medical Colleges', labelHi: 'अस्पताल नोटिस', icon: Building2 },
    { id: 'research', labelEn: 'Medical Research', labelHi: 'मेडिकल रिसर्च', icon: Microscope },
    { id: 'api-test', labelEn: 'API Testing', labelHi: 'एपीआई टेस्टिंग', icon: Terminal },
    { id: 'solver', labelEn: 'AI Problem Solver', labelHi: 'समस्या समाधान', icon: Sparkles },
    { id: 'market', labelEn: 'Market Research', labelHi: 'मार्केट रिसर्च', icon: ShoppingBag },
    { id: 'planning', labelEn: 'Planning & Matrix', labelHi: 'कार्ययोजना', icon: CalendarCheck },
    {
      id: 'reminders',
      labelEn: 'Vault & Reminders',
      labelHi: 'रिमाइंडर व वाल्ट',
      icon: Bookmark,
      badge: activeRemindersCount > 0 ? activeRemindersCount : undefined,
    },
    { id: 'settings', labelEn: 'Settings', labelHi: 'सेटिंग्स', icon: Sliders },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#facc15] border-b border-amber-600/30 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Top Header Line */}
        <div className="flex items-center justify-between h-16 border-b border-amber-500/30">
          {/* Brand */}
          <div
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 bg-red-700 text-yellow-300 flex items-center justify-center font-black text-xs tracking-tighter border border-red-900 shadow-xs">
              Dr
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight header-multicolor-red">
                  {isHindi ? 'एआई डॉक्टर' : 'AI Doctor'}
                </span>
                <span className="text-[10px] text-stone-700 font-mono hidden sm:inline">
                  {isHindi ? 'पर्सनल असिस्टेंट' : 'Personal Assistant'}
                </span>
              </div>
              <div className="text-[10px] text-stone-700 hidden sm:block truncate max-w-xs font-medium">
                {isHindi
                  ? 'दैनिक समाचार · अस्पताल अद्यतन · मेडिकल रिसर्च · समस्या समाधान'
                  : 'Daily News · Medical Hubs · Medical Research · Problem Solver'}
              </div>
            </div>
          </div>

          {/* Right Controls: Install Button, Language Switcher & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Auto-Diagnostics & Auto-Error Fixing */}
            {onOpenDiagnostics && (
              <button
                type="button"
                onClick={onOpenDiagnostics}
                className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-emerald-400 font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-stone-800 transition-colors"
                title={isHindi ? 'ऑटो-डायग्नोस्टिक्स व स्वतः त्रुटि निवारण' : 'Auto-Diagnostics & Auto-Error Fixing'}
              >
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden md:inline">{isHindi ? 'ऑटो-फिक्स' : 'Auto-Fix'}</span>
              </button>
            )}

            {/* Barcode & QR Scanner / WhatsApp App Transfer */}
            {onOpenBarcodeTransfer && (
              <button
                type="button"
                onClick={onOpenBarcodeTransfer}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-emerald-900 transition-colors"
                title={isHindi ? 'बारकोड स्कैन व व्हाट्सएप ट्रांसफर' : 'Barcode Scan & WhatsApp Transfer'}
              >
                <ScanLine className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">{isHindi ? 'बारकोड ट्रांसफर' : 'Scan & Transfer'}</span>
              </button>
            )}

            {/* Android Phone Barcode Install Button */}
            {onOpenAndroidInstall && (
              <button
                type="button"
                onClick={onOpenAndroidInstall}
                className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-yellow-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-emerald-950 transition-colors"
                title={isHindi ? 'बारकोड स्कैन द्वारा एंड्रॉयड ऐप इंस्टॉल' : 'Install on Android Phone'}
              >
                <Smartphone className="w-3.5 h-3.5 text-yellow-300" />
                <span className="hidden xl:inline">{isHindi ? 'एंड्रॉयड इंस्टॉल' : 'Android Install'}</span>
              </button>
            )}

            {/* Owner Freeware Distribution & URL Share Button */}
            {onOpenOwnerHub && (
              <button
                type="button"
                onClick={onOpenOwnerHub}
                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-stone-800 transition-colors"
                title={isHindi ? 'ओनर फ्रीवेयर URL शेयर करें' : 'Share Freeware URL'}
              >
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{isHindi ? 'ओनर शेयर' : 'Freeware URL'}</span>
              </button>
            )}

            {/* In-App Offline PWA Install Prompt */}
            <PWAInstallButton language={language} />

            {/* Bilingual toggle */}
            <div className="flex items-center border border-amber-600/40 p-0.5 bg-yellow-400/90 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-stone-800 hover:text-red-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 font-semibold transition-colors ${
                  language === 'hi'
                    ? 'bg-red-700 text-white shadow-2xs'
                    : 'text-stone-800 hover:text-red-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-800 hover:text-red-900 border border-amber-600/40 lg:hidden bg-yellow-400/80"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 py-1.5 overflow-x-auto scrollbar-none">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'text-red-900 border-red-700 bg-amber-300/80'
                    : 'text-stone-800 border-transparent hover:text-red-900 hover:bg-amber-300/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-700' : 'text-stone-700'}`} />
                <span>{isHindi ? item.labelHi : item.labelEn}</span>
                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] px-1 py-0.2 bg-red-700 text-white rounded-xs font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-600/30 bg-[#facc15] p-3 space-y-1 shadow-lg">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-2.5 text-xs font-medium text-left transition-colors ${
                  isActive
                    ? 'bg-red-700 text-white font-bold'
                    : 'text-stone-800 hover:bg-amber-300/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{isHindi ? item.labelHi : item.labelEn}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="font-mono text-[10px] px-1.5 py-0.5 bg-red-900 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick System Tools in Mobile Menu */}
          <div className="pt-2 border-t border-amber-600/40 grid grid-cols-3 gap-1.5">
            {onOpenDiagnostics && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDiagnostics();
                }}
                className="p-2 bg-stone-900 text-emerald-400 text-[11px] font-mono font-bold flex flex-col items-center justify-center gap-1"
              >
                <HeartPulse className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>{isHindi ? 'ऑटो-फिक्स' : 'Auto-Fix'}</span>
              </button>
            )}
            {onOpenBarcodeTransfer && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBarcodeTransfer();
                }}
                className="p-2 bg-emerald-700 text-white text-[11px] font-mono font-bold flex flex-col items-center justify-center gap-1"
              >
                <ScanLine className="w-3.5 h-3.5 text-amber-300" />
                <span>{isHindi ? 'बारकोड स्कैन' : 'Scan Code'}</span>
              </button>
            )}
            {onOpenAndroidInstall && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAndroidInstall();
                }}
                className="p-2 bg-emerald-800 text-yellow-300 text-[11px] font-mono font-bold flex flex-col items-center justify-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5 text-yellow-300" />
                <span>{isHindi ? 'एंड्रॉयड ऐप' : 'Android App'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
