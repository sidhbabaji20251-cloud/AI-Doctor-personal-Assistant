import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  ScanLine,
  Camera,
  Upload,
  Send,
  Download,
  Check,
  Copy,
  Smartphone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  RefreshCw,
  AlertCircle,
  Share2,
} from 'lucide-react';
import {
  AppTransferPayload,
  buildAppTransferUrl,
  parseTransferCode,
  decodeQrFromImageData,
  decodeQrFromImageFile,
  applyAppTransferPayload,
  generateWhatsAppTransferMessage,
  getQrCodeImageUrl,
} from '../utils/barcodeTransfer';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface BarcodeTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  onNavigateTab?: (tab: string) => void;
}

export const BarcodeTransferModal: React.FC<BarcodeTransferModalProps> = ({
  isOpen,
  onClose,
  language,
  onNavigateTab,
}) => {
  const isHindi = language === 'hi';
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Tabs: 'scan' (Receive & Install) | 'share' (Send via WhatsApp)
  const [activeTab, setActiveTab] = useState<'scan' | 'share'>('scan');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<AppTransferPayload | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Share generator state
  const [doctorNameInput, setDoctorNameInput] = useState('Dr. Rajesh Kumar Yadav');
  const [regInput, setRegInput] = useState('SMC-48291');
  const [copied, setCopied] = useState(false);

  // Load existing credentials on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_doctor_pad_details');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.doctorName) setDoctorNameInput(parsed.doctorName);
        if (parsed.doctorRegistrationNumber) setRegInput(parsed.doctorRegistrationNumber);
      }
    } catch {
      // Ignore
    }
  }, []);

  const transferUrl = buildAppTransferUrl(doctorNameInput, regInput);
  const qrImageUrl = getQrCodeImageUrl(transferUrl, 260);

  // Stop camera stream safely
  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Start live camera scanning
  const startCamera = async () => {
    setCameraError(null);
    setDecodedPayload(null);
    setTransferSuccess(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsScanning(true);
        scanFrameLoop();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('Camera start error:', message);
      setCameraError(
        isHindi
          ? 'कैमरा खोलने में असमर्थ। आप नीचे व्हाट्सएप स्क्रीनशॉट / इमेज अपलोड करके भी स्कैन कर सकते हैं।'
          : 'Unable to open camera. You can also upload a WhatsApp screenshot or QR image below.'
      );
      setIsScanning(false);
    }
  };

  // Frame processing loop
  const scanFrameLoop = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const result = decodeQrFromImageData(ctx, canvas.width, canvas.height);
      if (result && result.data) {
        handleRawDecodedCode(result.data);
        return; // stop loop
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanFrameLoop);
  };

  // Handle scanned raw string
  const handleRawDecodedCode = (codeText: string) => {
    stopCamera();
    const payload = parseTransferCode(codeText);
    if (payload) {
      setDecodedPayload(payload);
    } else {
      setCameraError(
        isHindi
          ? 'क्यूआर कोड पढ़ा गया परंतु यह मान्य AI Doctor ऐप ट्रांसफर कोड नहीं है।'
          : 'Scanned barcode recognized, but does not contain an AI Doctor App transfer format.'
      );
    }
  };

  // Handle File upload / WhatsApp screenshot
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCameraError(null);
      const decodedText = await decodeQrFromImageFile(file);
      if (decodedText) {
        handleRawDecodedCode(decodedText);
      } else {
        setCameraError(
          isHindi
            ? 'अपलोड किए गए इमेज में कोई बारकोड या क्यूआर कोड नहीं मिला।'
            : 'No barcode or QR code detected in the uploaded image. Please try a clearer screenshot.'
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setCameraError(`Image scan failed: ${message}`);
    }
  };

  // Apply received transfer and trigger install
  const handleApplyTransferAndInstall = async () => {
    if (!decodedPayload) return;

    applyAppTransferPayload(decodedPayload);
    setTransferSuccess(true);

    // If PWA is installable, prompt user immediately
    if (isInstallable) {
      try {
        await install();
      } catch {
        // Continue
      }
    }

    setTimeout(() => {
      if (onNavigateTab && decodedPayload.tab) {
        onNavigateTab(decodedPayload.tab);
      }
      onClose();
    }, 1200);
  };

  // WhatsApp Share Trigger
  const handleShareOnWhatsApp = () => {
    const message = generateWhatsAppTransferMessage(transferUrl, doctorNameInput, regInput);
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(transferUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Clean up streams when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setDecodedPayload(null);
      setTransferSuccess(false);
      setCameraError(null);
    } else if (activeTab === 'scan') {
      startCamera();
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-[#fefce8] border-2 border-stone-900 shadow-2xl max-w-2xl w-full my-6 text-stone-900 font-sans animate-in fade-in duration-200">
        {/* Header Bar */}
        <div className="bg-stone-900 text-amber-300 p-4 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-emerald-600 text-white flex items-center justify-center font-bold">
              <QrCode className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>{isHindi ? 'बारकोड / क्यूआर स्कैन व व्हाट्सएप ऐप ट्रांसफर' : 'Barcode & QR Scanner · WhatsApp App Transfer'}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-emerald-700 text-white font-mono uppercase tracking-wider">
                  PWA Install
                </span>
              </div>
              <div className="text-[11px] text-amber-300/80 font-mono">
                {isHindi
                  ? 'व्हाट्सएप से ऐप ट्रांसफर करें, बारकोड स्कैन करें व तुरंत ऑफ़लाइन इंस्टॉल करें'
                  : 'Scan from WhatsApp, transfer clinical presets & 1-click install offline PWA'}
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

        {/* Tab Switcher */}
        <div className="bg-stone-200 border-b border-stone-300 px-6 pt-3 flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => {
              setActiveTab('scan');
              setDecodedPayload(null);
              setCameraError(null);
            }}
            className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'scan'
                ? 'border-red-700 text-red-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <ScanLine className="w-4 h-4" />
            <span>{isHindi ? '1. बारकोड स्कैन करें (Receive & Install)' : '1. Scan Barcode (Receive & Install)'}</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setActiveTab('share');
            }}
            className={`px-4 py-2 font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'share'
                ? 'border-red-700 text-red-800 bg-white'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Share2 className="w-4 h-4 text-emerald-700" />
            <span>{isHindi ? '2. व्हाट्सएप पर ट्रांसफर करें (Send App)' : '2. Send via WhatsApp (Transfer Out)'}</span>
          </button>
        </div>

        {/* Body Area */}
        <div className="p-6 max-h-[65vh] overflow-y-auto">
          {activeTab === 'scan' ? (
            <div className="space-y-4">
              {/* If payload is decoded */}
              {decodedPayload ? (
                <div className="p-4 bg-emerald-50 border-2 border-emerald-600 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span>
                      {isHindi ? 'ऐप ट्रांसफर डेटा सफलतापूर्वक प्राप्त हुआ!' : 'App Transfer Payload Recognized!'}
                    </span>
                  </div>

                  <div className="bg-white p-3 border border-emerald-300 text-xs font-mono space-y-1.5">
                    <div className="flex justify-between border-b border-stone-200 pb-1">
                      <span className="text-stone-500">Source:</span>
                      <span className="font-bold text-emerald-800 uppercase">{decodedPayload.source}</span>
                    </div>
                    {decodedPayload.doctorName && (
                      <div className="flex justify-between border-b border-stone-200 pb-1">
                        <span className="text-stone-500">Doctor Name:</span>
                        <span className="font-bold text-stone-900">{decodedPayload.doctorName}</span>
                      </div>
                    )}
                    {decodedPayload.doctorRegistrationNumber && (
                      <div className="flex justify-between border-b border-stone-200 pb-1">
                        <span className="text-stone-500">SMC Reg No.:</span>
                        <span className="font-bold text-red-700">{decodedPayload.doctorRegistrationNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-stone-500">Target Tab:</span>
                      <span className="font-bold text-stone-900">{decodedPayload.tab || 'prescriptions'}</span>
                    </div>
                  </div>

                  {transferSuccess ? (
                    <div className="p-3 bg-emerald-600 text-white font-mono text-xs font-bold text-center flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{isHindi ? 'ट्रांसफर पूर्ण! क्लीनिकल सूट लोड हो रहा है...' : 'Transfer Applied! Loading Clinical Suite...'}</span>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={handleApplyTransferAndInstall}
                        className="flex-1 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <Smartphone className="w-4 h-4" />
                        <span>
                          {isInstallable
                            ? (isHindi ? 'ट्रांसफर स्वीकारें व होम स्क्रीन पर इंस्टॉल करें' : 'Accept Transfer & Install App on Device')
                            : (isHindi ? 'ट्रांसफर स्वीकारें व क्लीनिकल सूट खोलें' : 'Accept Transfer & Open Clinical Suite')}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDecodedPayload(null);
                          startCamera();
                        }}
                        className="py-2.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-mono text-xs"
                      >
                        {isHindi ? 'पुनः स्कैन करें' : 'Scan Another'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Camera Live Scanner Box */}
                  <div className="relative bg-black rounded-xs overflow-hidden aspect-video max-h-72 flex items-center justify-center border-2 border-stone-900 shadow-inner">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    {isScanning && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        {/* Target Reticle */}
                        <div className="w-48 h-48 sm:w-56 sm:h-56 border-2 border-emerald-400/80 relative rounded-sm shadow-2xl">
                          <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-amber-300"></div>
                          <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-amber-300"></div>
                          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-amber-300"></div>
                          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-amber-300"></div>
                          {/* Animated Scan Line */}
                          <div className="w-full h-0.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-400 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-md"></div>
                        </div>
                        <div className="mt-3 px-3 py-1 bg-black/75 text-amber-300 text-[11px] font-mono tracking-wide rounded-full">
                          {isHindi ? 'व्हाट्सएप स्क्रीन या प्रिस्क्रिप्शन बारकोड को फ्रेम में रखें' : 'Align WhatsApp screen or barcode within frame'}
                        </div>
                      </div>
                    )}

                    {!isScanning && !cameraError && (
                      <div className="text-center text-stone-400 p-6 space-y-2">
                        <Camera className="w-10 h-10 mx-auto opacity-50" />
                        <div className="text-xs font-mono">Camera standby</div>
                        <button
                          onClick={startCamera}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold"
                        >
                          {isHindi ? 'कैमरा चालू करें' : 'Start Camera'}
                        </button>
                      </div>
                    )}
                  </div>

                  {cameraError && (
                    <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <span>{cameraError}</span>
                    </div>
                  )}

                  {/* Alternative: Upload WhatsApp Screenshot / Image */}
                  <div className="p-4 bg-white border border-stone-300 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        {isHindi ? 'या व्हाट्सएप स्क्रीनशॉट / फोटो अपलोड करें' : 'Or Upload WhatsApp Screenshot / Photo'}
                      </span>
                      <span className="text-[10px] text-stone-500 font-mono">PNG, JPG, WebP</span>
                    </div>
                    <div className="text-[11px] text-stone-600 leading-snug">
                      {isHindi
                        ? 'यदि किसी डॉक्टर ने आपको व्हाट्सएप पर बारकोड भेजा है, तो उसका स्क्रीनशॉट या फोटो चुनें।'
                        : 'If a colleague sent you the transfer QR / barcode as a WhatsApp photo, choose the image file to scan immediately.'}
                    </div>
                    <label className="block cursor-pointer">
                      <div className="py-2 px-3 border border-dashed border-stone-400 hover:border-emerald-600 bg-stone-50 hover:bg-emerald-50/50 text-center text-xs font-mono text-stone-700 transition-colors">
                        <span>{isHindi ? '📁 व्हाट्सएप फोटो / स्क्रीनशॉट चुनें...' : '📁 Select WhatsApp Screenshot / Image...'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Share / Transfer Out Tab */
            <div className="space-y-4">
              <div className="text-xs text-stone-700 leading-relaxed">
                {isHindi
                  ? 'अपने फोन से दूसरे डॉक्टर या क्लीनिक स्टाफ को पूरी ऐप व प्रिस्क्रिप्शन सेटिंग्स ट्रांसफर करें। वे अपने फोन से यह बारकोड स्कैन करके तुरंत बिना ऐप स्टोर इंस्टॉल कर सकते हैं।'
                  : 'Transfer the entire application and outpatient letter pad presets to colleagues or clinic staff. They can scan this QR barcode on another smartphone or receive it on WhatsApp.'}
              </div>

              {/* Pre-fill Doctor & SMC Reg Fields for the Transfer URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white border border-stone-300 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 font-mono mb-1">
                    {isHindi ? 'डॉक्टर का नाम (Transfer Out):' : 'Doctor Name (for recipient):'}
                  </label>
                  <input
                    type="text"
                    value={doctorNameInput}
                    onChange={e => setDoctorNameInput(e.target.value)}
                    className="w-full p-2 border border-stone-300 font-mono text-xs focus:ring-1 focus:ring-stone-800"
                    placeholder="Dr. Rajesh Kumar Yadav"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 font-mono mb-1">
                    {isHindi ? 'SMC डॉक्टर पंजीकरण (Reg No):' : 'Doctor Reg No. (SMC.......):'}
                  </label>
                  <input
                    type="text"
                    value={regInput}
                    onChange={e => setRegInput(e.target.value)}
                    className="w-full p-2 border border-stone-300 font-mono text-xs focus:ring-1 focus:ring-stone-800"
                    placeholder="SMC-48291"
                  />
                </div>
              </div>

              {/* Barcode / QR Display Card */}
              <div className="p-4 bg-white border-2 border-stone-900 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
                <div className="p-2 bg-white border border-stone-300 shrink-0 shadow-xs">
                  <img
                    src={qrImageUrl}
                    alt="AI Doctor Transfer Barcode"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-red-700" />
                    <span>AI Doctor WhatsApp Transfer Card</span>
                  </div>
                  <div className="text-[11px] text-stone-600 font-mono">
                    Scannable via built-in Barcode Scanner, WhatsApp Camera, or Google Lens.
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleShareOnWhatsApp}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isHindi ? 'व्हाट्सएप पर भेजें' : 'Send via WhatsApp'}</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? (isHindi ? 'कॉपी हुआ!' : 'Copied!') : (isHindi ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-600 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>AI Doctor WhatsApp Peer-to-Peer Transfer Engine · Freeware</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-mono font-bold text-xs transition-colors"
          >
            {isHindi ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
