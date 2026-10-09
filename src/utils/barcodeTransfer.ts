/**
 * Barcode & QR Code Scanning, Installation & WhatsApp App Transfer Engine
 * AI Doctor Personal Assistant
 * 
 * Supports live camera scanning, WhatsApp screenshot decoding,
 * barcode transfer packaging, and 1-click PWA app installation.
 */

import jsQR from 'jsqr';

export interface AppTransferPayload {
  app: string;
  version: string;
  source: 'whatsapp_transfer' | 'direct_qr' | 'owner_distribution';
  targetUrl: string;
  doctorName?: string;
  doctorRegistrationNumber?: string;
  hospitalClinicName?: string;
  tab?: string;
  timestamp: string;
  transferId: string;
}

/**
 * Builds standard transfer URL
 */
export function buildAppTransferUrl(
  doctorName: string = 'Dr. Rajesh Kumar Yadav',
  regNumber: string = 'SMC-48291',
  hospitalName: string = 'AI DOCTOR PERSONAL ASSISTANT · CLINICAL PRACTICE & TELE-CONSULTATION',
  targetTab: string = 'prescriptions'
): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-2hkwtujqhst3gqnhtivnrb-236247641087.asia-southeast1.run.app';
  const params = new URLSearchParams();
  params.set('mode', 'freeware');
  params.set('source', 'whatsapp_transfer');
  params.set('doctor', doctorName);
  params.set('reg', regNumber);
  params.set('tab', targetTab);
  params.set('tid', `tr_${Date.now().toString(36)}`);

  return `${origin}?${params.toString()}`;
}

/**
 * Encodes payload into packed transfer JSON string or URL
 */
export function packTransferData(payload: Partial<AppTransferPayload>): string {
  const transferUrl = buildAppTransferUrl(
    payload.doctorName,
    payload.doctorRegistrationNumber,
    payload.hospitalClinicName,
    payload.tab
  );

  return transferUrl;
}

/**
 * Parses decoded QR code / barcode string into AppTransferPayload
 */
export function parseTransferCode(codeText: string): AppTransferPayload | null {
  if (!codeText || typeof codeText !== 'string') return null;

  const trimmed = codeText.trim();

  // Case 1: JSON payload
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.app === 'AI_DOCTOR' || parsed.source === 'whatsapp_transfer' || parsed.targetUrl) {
        return {
          app: 'AI Doctor Personal Assistant',
          version: parsed.version || '2.5.0',
          source: parsed.source || 'whatsapp_transfer',
          targetUrl: parsed.targetUrl || parsed.url || window.location.origin,
          doctorName: parsed.doctorName || parsed.doctor,
          doctorRegistrationNumber: parsed.doctorRegistrationNumber || parsed.reg,
          hospitalClinicName: parsed.hospitalClinicName,
          tab: parsed.tab || 'prescriptions',
          timestamp: parsed.timestamp || new Date().toISOString(),
          transferId: parsed.transferId || `tr_${Date.now().toString(36)}`,
        };
      }
    } catch {
      // Not JSON, continue to URL parser
    }
  }

  // Case 2: URL containing params or app address
  try {
    let urlObj: URL;
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      urlObj = new URL(trimmed);
    } else {
      urlObj = new URL(`https://${trimmed}`);
    }

    const doctor = urlObj.searchParams.get('doctor');
    const reg = urlObj.searchParams.get('reg');
    const tab = urlObj.searchParams.get('tab') || 'prescriptions';
    const source = urlObj.searchParams.get('source') || 'whatsapp_transfer';
    const tid = urlObj.searchParams.get('tid') || `tr_${Date.now().toString(36)}`;

    return {
      app: 'AI Doctor Personal Assistant',
      version: '2.5.0',
      source: source === 'whatsapp_transfer' ? 'whatsapp_transfer' : 'direct_qr',
      targetUrl: urlObj.href,
      doctorName: doctor || undefined,
      doctorRegistrationNumber: reg || undefined,
      tab,
      timestamp: new Date().toISOString(),
      transferId: tid,
    };
  } catch {
    // If it's a doctor registration SMC code directly scanned from badge/paper
    if (trimmed.toUpperCase().startsWith('SMC') || /^[A-Z0-9\-_]{4,15}$/i.test(trimmed)) {
      return {
        app: 'AI Doctor Personal Assistant',
        version: '2.5.0',
        source: 'direct_qr',
        targetUrl: buildAppTransferUrl('Dr. Rajesh Kumar Yadav', trimmed.toUpperCase()),
        doctorName: 'Dr. Rajesh Kumar Yadav',
        doctorRegistrationNumber: trimmed.toUpperCase(),
        tab: 'prescriptions',
        timestamp: new Date().toISOString(),
        transferId: `tr_${Date.now().toString(36)}`,
      };
    }
  }

  return null;
}

/**
 * Decodes QR code from a canvas image data using jsQR
 */
export function decodeQrFromImageData(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
): { data: string; location: unknown } | null {
  try {
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });
    if (code && code.data) {
      return { data: code.data, location: code.location };
    }
  } catch (err) {
    console.warn('[Barcode Decoder] Frame decode warning:', err);
  }
  return null;
}

/**
 * Decodes QR code from an uploaded Image / File (e.g. WhatsApp screenshot)
 */
export async function decodeQrFromImageFile(file: File): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const result = decodeQrFromImageData(ctx, img.width, img.height);
        if (result) {
          resolve(result.data);
        } else {
          // Try scaling down if resolution is ultra high (modern phone photos)
          if (img.width > 1200 || img.height > 1200) {
            const scale = Math.min(1000 / img.width, 1000 / img.height);
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const scaledResult = decodeQrFromImageData(ctx, canvas.width, canvas.height);
            resolve(scaledResult ? scaledResult.data : null);
            return;
          }
          resolve(null);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for barcode decoding'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Applies received transfer payload into local app state and initiates PWA install
 */
export function applyAppTransferPayload(payload: AppTransferPayload): {
  doctorName?: string;
  doctorRegistrationNumber?: string;
  tab?: string;
} {
  try {
    const existing = localStorage.getItem('ai_doctor_pad_details');
    const parsed = existing ? JSON.parse(existing) : {};

    if (payload.doctorName) {
      parsed.doctorName = payload.doctorName;
    }
    if (payload.doctorRegistrationNumber) {
      parsed.doctorRegistrationNumber = payload.doctorRegistrationNumber;
      parsed.doctorRegistrationSMC = payload.doctorRegistrationNumber;
    }
    if (payload.hospitalClinicName) {
      parsed.hospitalClinicName = payload.hospitalClinicName;
    }

    localStorage.setItem('ai_doctor_pad_details', JSON.stringify(parsed));

    // Save transfer log in history
    const historyItem = {
      id: `transfer_${Date.now()}`,
      action: 'APP_TRANSFER_RECEIVED',
      title: `App Transferred via WhatsApp / Barcode`,
      details: `Doctor: ${payload.doctorName || 'Standard'} | Reg: ${payload.doctorRegistrationNumber || 'SMC'}`,
      timestamp: new Date().toLocaleTimeString(),
    };
    try {
      const historyRaw = localStorage.getItem('aidoctor_history');
      const hist = historyRaw ? JSON.parse(historyRaw) : [];
      localStorage.setItem('aidoctor_history', JSON.stringify([historyItem, ...hist.slice(0, 49)]));
    } catch {
      // Ignore history save error
    }

    return {
      doctorName: payload.doctorName,
      doctorRegistrationNumber: payload.doctorRegistrationNumber,
      tab: payload.tab,
    };
  } catch (err) {
    console.error('Failed to apply app transfer payload:', err);
    return {};
  }
}

/**
 * Generates ready-to-send WhatsApp transfer text
 */
export function generateWhatsAppTransferMessage(
  transferUrl: string,
  doctorName: string = 'Dr. Rajesh Kumar Yadav',
  regNumber: string = 'SMC-48291'
): string {
  return (
    `📲 *AI Doctor Personal Assistant — App Transfer & Install Link*\n\n` +
    `Dear Colleague / Clinic Team,\n\n` +
    `Here is the verified Freeware Application transfer link with pre-calibrated Golwala Prescriptions & SMC Outpatient Letter Pad:\n\n` +
    `👉 *Open & Auto-Install:* ${transferUrl}\n\n` +
    `✨ *Quick Instructions:*\n` +
    `1. Tap link to open on Chrome / Safari.\n` +
    `2. In AI Doctor app, tap "Install Offline App" or scan the QR barcode.\n` +
    `3. Pre-calibrated Doctor: *${doctorName}* (Reg: *${regNumber}*).\n` +
    `4. Works 100% offline in remote areas (Rajasthan & Himachal).\n\n` +
    `Owner Support: sidhbabaji20251@gmail.com`
  );
}

/**
 * QR Code URL Generator using high-reliability public QR generator service
 */
export function getQrCodeImageUrl(data: string, size: number = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&margin=10&data=${encodeURIComponent(
    data
  )}`;
}
