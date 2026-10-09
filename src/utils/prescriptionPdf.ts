import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  patientName?: string;
  conditionName?: string;
}

/**
 * Renders an HTML element into a high-quality A4 PDF Blob or triggers download.
 */
export async function generatePrescriptionPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<{ blob: Blob; filename: string }> {
  const patientClean = (options.patientName || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const conditionClean = (options.conditionName || 'Prescription').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `Prescription_${patientClean}_${conditionClean}_${dateStr}.pdf`;

  // Render element canvas with high DPI for crisp print quality
  const canvas = await html2canvas(element, {
    scale: 2, // 2x DPI for crisp medical text & tables
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth || 800,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pdfWidth = 210;
  const pdfHeight = 297;
  const margin = 10; // 10mm margin
  const contentWidth = pdfWidth - margin * 2;
  const imgProps = pdf.getImageProperties(imgData);
  const contentHeight = (imgProps.height * contentWidth) / imgProps.width;

  // If content fits on one page (or near it)
  if (contentHeight <= pdfHeight - margin * 2) {
    pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, contentHeight);
  } else {
    // Multi-page rendering if prescription is tall
    let heightLeft = contentHeight;
    let position = margin;
    let page = 1;

    pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
    heightLeft -= (pdfHeight - margin * 2);

    while (heightLeft > 0) {
      pdf.addPage();
      page++;
      position = margin - (page - 1) * (pdfHeight - margin * 2);
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfHeight - margin * 2);
    }
  }

  const blob = pdf.output('blob');
  return { blob, filename };
}

/**
 * Downloads the PDF directly to device.
 */
export async function downloadPrescriptionPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<string> {
  const { blob, filename } = await generatePrescriptionPdf(element, options);
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  return filename;
}

/**
 * Shares or prepares prescription PDF for WhatsApp.
 * Supports:
 * 1. Web Share API with File (on mobile Chrome, Safari, Android, iOS WhatsApp app directly receives the PDF file)
 * 2. Fallback: downloads PDF to device and opens WhatsApp with pre-filled message and clinical summary
 */
export async function sharePrescriptionOnWhatsApp(
  element: HTMLElement,
  details: {
    doctorName: string;
    doctorRegistrationSMC: string;
    patientName: string;
    patientPhone?: string;
    provisionalDiagnosis: string;
    rxCount: number;
    clinicName: string;
    conditionName: string;
  }
): Promise<{ sharedViaApi: boolean; filename: string }> {
  const { blob, filename } = await generatePrescriptionPdf(element, {
    patientName: details.patientName,
    conditionName: details.conditionName,
  });

  const file = new File([blob], filename, { type: 'application/pdf' });

  // WhatsApp formatted message text
  const messageText = [
    `🏥 *${details.clinicName.toUpperCase()}*`,
    `📄 *MEDICAL PRESCRIPTION / पर्चा*`,
    `--------------------------------`,
    `👨‍⚕️ *Doctor:* ${details.doctorName}`,
    `🆔 *Regn. No:* ${details.doctorRegistrationSMC} (SMC)`,
    `👤 *Patient:* ${details.patientName}`,
    `🩺 *Provisional Diagnosis:* ${details.provisionalDiagnosis}`,
    `💊 *Rx Medications:* ${details.rxCount} item(s) prescribed`,
    `--------------------------------`,
    `📎 Attached PDF: *${filename}*`,
    `⚠️ Please take medications as advised. In case of emergency or red flag symptoms, contact OPD immediately.`,
  ].join('\n');

  // Check if Navigator Share supports PDF file sharing (Mobile browsers, WhatsApp, etc.)
  if (
    navigator.canShare &&
    navigator.canShare({
      files: [file],
    })
  ) {
    try {
      await navigator.share({
        title: `Prescription - ${details.patientName}`,
        text: messageText,
        files: [file],
      });
      return { sharedViaApi: true, filename };
    } catch (err: unknown) {
      // If user cancelled share sheet, rethrow or return
      if (err instanceof Error && err.name === 'AbortError') {
        return { sharedViaApi: false, filename };
      }
      // Fallback below if sharing files failed
    }
  }

  // Fallback:
  // 1. Trigger the PDF download so the patient/doctor has the file on device
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);

  // 2. Open WhatsApp Web / App with pre-filled message text
  const cleanPhone = (details.patientPhone || '').replace(/[^0-9]/g, '');
  const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : '';
  const waUrl = phoneParam
    ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(messageText)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;

  // Open WhatsApp in new tab/app
  window.open(waUrl, '_blank');

  return { sharedViaApi: false, filename };
}
