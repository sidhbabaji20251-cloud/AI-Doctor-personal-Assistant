import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StandardPrescriptionView } from './components/StandardPrescriptionView';
import { DrugSubstituteView } from './components/DrugSubstituteView';
import { DoctorsNewsView } from './components/DoctorsNewsView';
import { DailyNewsView } from './components/DailyNewsView';
import { MedicalInstitutionsView } from './components/MedicalInstitutionsView';
import { MedicalResearchView } from './components/MedicalResearchView';
import { ProblemSolverView } from './components/ProblemSolverView';
import { MarketResearchView } from './components/MarketResearchView';
import { PlanningView } from './components/PlanningView';
import { RemindersBookmarksView } from './components/RemindersBookmarksView';
import { SettingsView } from './components/SettingsView';
import { ExternalActionModal } from './components/ExternalActionModal';
import { OfflineBanner } from './components/OfflineBanner';
import { AdvertisingBanner } from './components/AdvertisingBanner';
import { OwnerShareHubModal } from './components/OwnerShareHubModal';
import { AutoDiagnosticModal } from './components/AutoDiagnosticModal';
import { BarcodeTransferModal } from './components/BarcodeTransferModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { initAutoDiagnosticWatchdog } from './utils/autoDiagnosticEngine';
import { ApiTestingView } from './components/ApiTestingView';
import { ShieldCheck, PhoneCall, Share2, Terminal, Sparkles, HeartPulse, ScanLine, Smartphone } from 'lucide-react';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOwnerShareOpen, setIsOwnerShareOpen] = useState(false);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isBarcodeTransferOpen, setIsBarcodeTransferOpen] = useState(false);
  const [isAndroidInstallOpen, setIsAndroidInstallOpen] = useState(false);
  const { language, requestExternalAction } = useApp();
  const isHindi = language === 'hi';

  // Read URL query parameters and init background watchdog
  useEffect(() => {
    // Background watchdog for auto-recovery & error prevention
    const cleanupWatchdog = initAutoDiagnosticWatchdog((errorMsg) => {
      console.info('[AI Doctor Auto-Watchdog Guard]', errorMsg);
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const modeParam = params.get('mode');
      const shareParam = params.get('owner_share');
      const sourceParam = params.get('source');
      const scanParam = params.get('scan');
      const diagParam = params.get('diag');
      const installParam = params.get('install');

      if (tabParam) {
        setActiveTab(tabParam);
      } else if (modeParam === 'test') {
        setActiveTab('api-test');
      }

      if (shareParam === 'true' || shareParam === '1') {
        setIsOwnerShareOpen(true);
      }

      if (sourceParam === 'whatsapp_transfer' || scanParam === 'true' || scanParam === '1') {
        setIsBarcodeTransferOpen(true);
      }

      if (diagParam === 'true' || diagParam === '1') {
        setIsDiagnosticsOpen(true);
      }

      // If user scanned the Android installation barcode or has ?install=android
      const isAndroidDevice = /Android/i.test(navigator.userAgent);
      if (installParam === 'android' || (sourceParam === 'barcode_scan' && isAndroidDevice)) {
        setIsAndroidInstallOpen(true);
      }

      // If doctor credentials were sent via URL, save them for the prescription letter pad
      const doctorParam = params.get('doctor');
      const regParam = params.get('reg');
      if (doctorParam || regParam) {
        try {
          const existing = localStorage.getItem('ai_doctor_pad_details');
          const parsed = existing ? JSON.parse(existing) : {};
          if (doctorParam) parsed.doctorName = doctorParam;
          if (regParam) parsed.doctorRegistrationNumber = regParam;
          localStorage.setItem('ai_doctor_pad_details', JSON.stringify(parsed));
        } catch {
          // Ignore storage error
        }
      }
    }

    return () => {
      if (cleanupWatchdog) cleanupWatchdog();
    };
  }, []);

  const handleCallEmergency = (number: string, serviceName: string) => {
    requestExternalAction({
      title: isHindi ? 'आपातकालीन कॉल स्वीकृति' : 'Emergency Call Approval',
      description: isHindi
        ? `आप राष्ट्रीय आपातकालीन सेवा ${serviceName} (${number}) पर कॉल करने जा रहे हैं। क्या आप पुष्टि करते हैं?`
        : `You are about to initiate an emergency call to ${serviceName} (${number}). Please confirm.`,
      actionLabel: isHindi ? 'कॉल करें' : 'Proceed Call',
      target: `tel:${number}`,
      onConfirm: () => {
        window.location.href = `tel:${number}`;
      },
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eab308] text-stone-900 font-sans">
      <OfflineBanner language={language} />
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenOwnerHub={() => setIsOwnerShareOpen(true)}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenBarcodeTransfer={() => setIsBarcodeTransferOpen(true)}
        onOpenAndroidInstall={() => setIsAndroidInstallOpen(true)}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 md:py-6">
        {/* Healthcare & Medical Outreach Advertising Banner */}
        <AdvertisingBanner
          onNavigateTab={setActiveTab}
          onOpenOwnerHub={() => setIsOwnerShareOpen(true)}
        />

        {activeTab === 'dashboard' && <DashboardView onNavigateTab={setActiveTab} />}
        {activeTab === 'prescriptions' && <StandardPrescriptionView onNavigateTab={setActiveTab} />}
        {activeTab === 'drugs' && <DrugSubstituteView />}
        {activeTab === 'doctors' && <DoctorsNewsView />}
        {activeTab === 'news' && <DailyNewsView />}
        {activeTab === 'institutes' && <MedicalInstitutionsView />}
        {activeTab === 'research' && <MedicalResearchView />}
        {activeTab === 'api-test' && <ApiTestingView onOpenOwnerHub={() => setIsOwnerShareOpen(true)} />}
        {activeTab === 'solver' && <ProblemSolverView />}
        {activeTab === 'market' && <MarketResearchView />}
        {activeTab === 'planning' && <PlanningView />}
        {activeTab === 'reminders' && <RemindersBookmarksView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Emergency Strip & Footer */}
      <footer className="mt-auto border-t border-amber-600/30 bg-amber-300/80 backdrop-blur-xs text-stone-900 shadow-sm">
        {/* Freeware Distribution & Owner Verification Strip */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 bg-stone-900 text-amber-300 text-xs flex flex-wrap items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-red-700 text-white font-bold text-[10px]">FREEWARE</span>
            <span className="text-stone-200">
              {isHindi
                ? 'ओनर द्वारा URL द्वारा भेजा जाने वाला अधिकृत फ्रीवेयर · क्लीनिकल टेस्टिंग व विज्ञापन'
                : 'Freeware Edition · Distributed exclusively by owner via Web URL for testing & advertising'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsOwnerShareOpen(true)}
              className="text-amber-300 hover:text-white underline font-bold flex items-center gap-1"
            >
              <Share2 className="w-3 h-3" />
              <span>{isHindi ? 'ओनर शेयर URL' : 'Send as Freeware URL'}</span>
            </button>
            <span>·</span>
            <button
              onClick={() => setActiveTab('api-test')}
              className="text-amber-300 hover:text-white underline font-bold flex items-center gap-1"
            >
              <Terminal className="w-3 h-3" />
              <span>{isHindi ? 'टेस्टिंग API' : 'Test Integrated API'}</span>
            </button>
            <span>·</span>
            <span className="text-stone-400">sidhbabaji20251@gmail.com</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-800">
            <ShieldCheck className="w-4 h-4 text-red-700" />
            <span className="font-semibold text-stone-900">
              {isHindi ? 'त्वरित आपातकालीन हेल्पलाइन (भारत): ' : 'Emergency Health Helplines (India): '}
            </span>
            <button
              onClick={() => handleCallEmergency('108', 'National Ambulance Service')}
              className="font-mono text-red-900 hover:underline font-bold"
            >
              108 (Ambulance)
            </button>
            <span>·</span>
            <button
              onClick={() => handleCallEmergency('112', 'All-in-One Emergency')}
              className="font-mono text-red-900 hover:underline font-bold"
            >
              112 (National Emergency)
            </button>
            <span>·</span>
            <button
              onClick={() => handleCallEmergency('1075', 'National Health Portal')}
              className="font-mono text-red-900 hover:underline font-bold"
            >
              1075 (Health Desk)
            </button>
          </div>

          <div className="text-[11px] text-stone-700 font-medium">
            {isHindi
              ? 'सत्यापित साक्ष्य आधारित · अनिश्चितता का पूर्ण प्रकटीकरण · निजी स्थानीय संग्रहण'
              : 'Verified Evidence · Uncertainty Disclosed · Local Data Privacy'}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-700">
          <div>
            <div className="font-bold text-stone-900 text-sm">
              {isHindi ? 'AI Doctor Personal Assistant — व्यक्तिगत एआई चिकित्सा, समाचार व समस्या समाधान सहायक' : 'AI Doctor Personal Assistant — Personal AI Clinical, Medical Research & Problem Solver'}
            </div>
            <div className="text-[11px] text-stone-800 mt-0.5">
              Tracking IGMC Shimla, Dr RPGMC Tanda, Dr RKGMC Hamirpur, SMS Jaipur, NIMS Jaipur · Rajasthan & Himachal Pradesh
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-800 font-medium">
            <span>Powered by Gemini 3.8 & Google Search Grounding</span>
          </div>
        </div>
      </footer>

      {/* External Action Approval Modal */}
      <ExternalActionModal />

      {/* Auto-Diagnostics & Auto-Error Fixing Modal */}
      <AutoDiagnosticModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        language={language}
      />

      {/* Barcode & QR Code Scanner / WhatsApp App Transfer Modal */}
      <BarcodeTransferModal
        isOpen={isBarcodeTransferOpen}
        onClose={() => setIsBarcodeTransferOpen(false)}
        language={language}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsBarcodeTransferOpen(false);
        }}
      />

      {/* Android Phone Barcode Scan Auto-Installation Modal */}
      <AndroidInstallModal
        isOpen={isAndroidInstallOpen}
        onClose={() => setIsAndroidInstallOpen(false)}
        language={language}
      />

      {/* Owner Freeware Distribution & URL Share Hub */}
      <OwnerShareHubModal
        isOpen={isOwnerShareOpen}
        onClose={() => setIsOwnerShareOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsOwnerShareOpen(false);
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
