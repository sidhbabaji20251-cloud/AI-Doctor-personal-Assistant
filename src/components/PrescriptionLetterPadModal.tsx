import React, { useState, useRef } from 'react';
import {
  Printer,
  Copy,
  CheckCircle2,
  X,
  Edit3,
  RotateCcw,
  Stethoscope,
  ShieldCheck,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  CheckSquare,
  Download,
  Share2,
  Phone,
  Loader2,
} from 'lucide-react';
import { StandardPrescription } from '../types';
import {
  LetterPadDetails,
  createDefaultLetterPadDetails,
} from '../utils/prescriptionLetterPad';
import {
  downloadPrescriptionPdf,
  sharePrescriptionOnWhatsApp,
} from '../utils/prescriptionPdf';

interface PrescriptionLetterPadModalProps {
  prescription: StandardPrescription;
  language?: 'en' | 'hi';
  onClose: () => void;
}

export const PrescriptionLetterPadModal: React.FC<PrescriptionLetterPadModalProps> = ({
  prescription,
  language = 'en',
  onClose,
}) => {
  const isHindi = language === 'hi';

  const [details, setDetails] = useState<LetterPadDetails>(() =>
    createDefaultLetterPadDetails(prescription)
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [newSymptomText, setNewSymptomText] = useState<string>('');
  
  // PDF & WhatsApp states
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [isSharingWhatsApp, setIsSharingWhatsApp] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Ref to the actual printable letter pad content
  const letterPadRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleResetDefaults = () => {
    setDetails(createDefaultLetterPadDetails(prescription));
  };

  const handleAddSymptom = () => {
    if (newSymptomText.trim()) {
      setDetails((prev) => ({
        ...prev,
        symptomsAndComplaints: [...prev.symptomsAndComplaints, newSymptomText.trim()],
      }));
      setNewSymptomText('');
    }
  };

  const handleRemoveSymptom = (index: number) => {
    setDetails((prev) => ({
      ...prev,
      symptomsAndComplaints: prev.symptomsAndComplaints.filter((_, i) => i !== index),
    }));
  };

  // Download PDF Handler
  const handleDownloadPdf = async () => {
    if (!letterPadRef.current) return;
    setIsGeneratingPdf(true);
    setStatusMessage(isHindi ? 'PDF तैयार हो रहा है...' : 'Generating PDF...');
    try {
      const filename = await downloadPrescriptionPdf(letterPadRef.current, {
        patientName: details.patientName,
        conditionName: prescription.diseaseName,
      });
      setStatusMessage(
        isHindi
          ? `PDF डाउनलोड सफल: ${filename}`
          : `PDF Downloaded successfully: ${filename}`
      );
      setTimeout(() => setStatusMessage(null), 5000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      setStatusMessage(
        isHindi ? 'PDF निर्माण में त्रुटि हुई।' : 'Error generating PDF. Please try Print.'
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // WhatsApp Share Handler
  const handleWhatsAppShare = async () => {
    if (!letterPadRef.current) return;
    setIsSharingWhatsApp(true);
    setStatusMessage(
      isHindi ? 'व्हाट्सएप हेतु PDF तैयार किया जा रहा है...' : 'Preparing PDF for WhatsApp...'
    );
    try {
      const result = await sharePrescriptionOnWhatsApp(letterPadRef.current, {
        doctorName: details.doctorName,
        doctorRegistrationSMC: details.doctorRegistrationSMC,
        patientName: details.patientName,
        patientPhone: details.patientPhone,
        provisionalDiagnosis: details.provisionalDiagnosis,
        rxCount: prescription.rxMedications.length,
        clinicName: details.hospitalClinicName,
        conditionName: prescription.diseaseName,
      });

      if (result.sharedViaApi) {
        setStatusMessage(
          isHindi
            ? 'व्हाट्सएप शेयर शीट खुल गई है।'
            : 'Share dialog opened with PDF attached.'
        );
      } else {
        setStatusMessage(
          isHindi
            ? `PDF डाउनलोड हुआ (${result.filename}) और व्हाट्सएप संदेश तैयार है!`
            : `PDF saved (${result.filename}) & WhatsApp opened!`
        );
      }
      setTimeout(() => setStatusMessage(null), 6000);
    } catch (err) {
      console.error('Failed to share on WhatsApp:', err);
      setStatusMessage(
        isHindi
          ? 'व्हाट्सएप शेयर में त्रुटि हुई।'
          : 'Could not open WhatsApp sharing.'
      );
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsSharingWhatsApp(false);
    }
  };

  const handleCopyLetterPad = () => {
    const textLines = [
      `===================================================================`,
      `${details.hospitalClinicName}`,
      `${details.clinicAddress}`,
      `Consultation Helpline: ${details.contactNumber}`,
      `-------------------------------------------------------------------`,
      `DOCTOR DETAILS:`,
      `Doctor Name: ${details.doctorName}`,
      `Registration: ${details.doctorRegistrationSMC} (State Medical Council)`,
      `Qualifications: ${details.doctorDegree} | ${details.doctorDesignation}`,
      `===================================================================`,
      `PATIENT INFORMATION:`,
      `Name of Patient: ${details.patientName}`,
      `Age / Gender: ${details.patientAge} / ${details.patientGender} | Date: ${details.date}`,
      `Phone: ${details.patientPhone || 'N/A'}`,
      `OPD No.: ${details.opdNumber}`,
      `Vitals: BP: ${details.vitals.bloodPressure || 'N/A'} | Pulse: ${details.vitals.pulse || 'N/A'} | Wt: ${details.vitals.weight || 'N/A'}`,
      `-------------------------------------------------------------------`,
      `1. SYMPTOMS & CHIEF COMPLAINTS (लक्षण व शिकायतें):`,
      ...details.symptomsAndComplaints.map((sym, idx) => `   (${idx + 1}) ${sym}`),
      ``,
      `2. PROVISIONAL DIAGNOSIS (संभावित निदान):`,
      `   ${details.provisionalDiagnosis}`,
      `   Clinical Reference: ${prescription.golwalaReference || "Golwala's Medicine"}`,
      ``,
      `3. ℞ TREATMENT PRESCRIPTION (दवा पर्चा):`,
      ...prescription.rxMedications.map(
        (m, idx) =>
          `   ${idx + 1}. [${m.dosageForm}] ${m.genericSalt.toUpperCase()} (${m.strength})\n` +
          `      Brand Reference: ${m.brandExamples}\n` +
          `      Frequency: ${m.frequency} | Timing: ${m.timing} | Duration: ${m.duration}\n` +
          `      Instructions: ${m.instructions}${m.golwalaNote ? `\n      Golwala Note: ${m.golwalaNote}` : ''}`
      ),
      ``,
      `DIETARY & LIFESTYLE ADVICE:`,
      ...prescription.nonPharmAdvice.map((a) => `   • ${a}`),
      ``,
      `INVESTIGATIONS ADVISED:`,
      ...prescription.mandatoryInvestigations.map((inv) => `   • ${inv}`),
      ``,
      `EMERGENCY WARNING SIGNS:`,
      ...prescription.redFlagsAndHospitalize.map((rf) => `   ! ${rf}`),
      `-------------------------------------------------------------------`,
      details.showDoctorNameInPlaceOfSignature
        ? `DOCTOR NAME (In place of physical signature): ${details.doctorName}\nRegistration No.: ${details.doctorRegistrationSMC}\n[Digitally Authorized Outpatient Prescriber]`
        : `DOCTOR SIGNATURE: _____________________\n${details.doctorName}\n${details.doctorRegistrationSMC}`,
      `===================================================================`,
      `Note: Clinical Golwala Reference Protocol for registered medical practitioners.`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
      {/* Container Card */}
      <div className="bg-white max-w-4xl w-full max-h-[96vh] overflow-y-auto border-4 border-stone-900 shadow-2xl flex flex-col font-sans print:border-none print:shadow-none print:max-w-full print:max-h-none print:overflow-visible">
        {/* Modal Controls Toolbar (Hidden on Print) */}
        <div className="bg-stone-900 text-stone-100 px-4 py-3 flex flex-wrap items-center justify-between gap-2 border-b-2 border-red-600 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-red-700 text-white font-mono text-xs font-bold">
              Rx PAD
            </span>
            <h2 className="font-serif font-bold text-sm sm:text-base text-amber-300">
              {isHindi
                ? 'डॉक्टर प्रिस्क्रिप्शन लेटर पैड (SMC प्रारूप)'
                : 'Doctor Prescription Letter Pad (SMC Standard Pad)'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-2.5 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Download Prescription as PDF Document"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating...' : (isHindi ? 'PDF डाउनलोड' : 'Download PDF')}</span>
            </button>

            {/* Send on WhatsApp Button */}
            <button
              onClick={handleWhatsAppShare}
              disabled={isSharingWhatsApp}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Send Prescription PDF on WhatsApp"
            >
              {isSharingWhatsApp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isSharingWhatsApp ? 'Preparing...' : (isHindi ? 'व्हाट्सएप भेजें' : 'Send WhatsApp')}</span>
            </button>

            {/* Print Slip */}
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-600 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
              title="Print standard letter pad slip"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? 'प्रिंट' : 'Print'}</span>
            </button>

            {/* Customize Drawer Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-2.5 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors border ${
                isEditing
                  ? 'bg-amber-400 text-stone-900 border-amber-300'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-600'
              }`}
              title="Edit Doctor, Patient, Symptoms & Diagnosis fields"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? (isHindi ? 'संपादन बंद' : 'Done') : (isHindi ? 'विवरण बदलें' : 'Customize')}</span>
            </button>

            {/* Copy Text */}
            <button
              onClick={handleCopyLetterPad}
              className="px-2 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-600 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
              title="Copy complete prescription text"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{isHindi ? 'कॉपी' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'कॉपी' : 'Copy'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner (if any) */}
        {statusMessage && (
          <div className="bg-emerald-50 border-b border-emerald-300 text-emerald-900 px-4 py-2 text-xs font-mono flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMessage}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-stone-500 hover:text-stone-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Customization Drawer / Editor (Visible when user toggles 'Customize Pad') */}
        {isEditing && (
          <div className="bg-amber-50/80 p-4 border-b-2 border-stone-300 print:hidden text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200">
              <span className="font-mono font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-700" />
                {isHindi ? 'लेटर पैड कस्टमाइज़ेशन' : 'Customize Letter Pad Details'}
              </span>
              <button
                onClick={handleResetDefaults}
                className="text-[11px] font-mono text-stone-600 hover:text-red-700 underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                {isHindi ? 'डिफ़ॉल्ट रीसेट करें' : 'Reset to Defaults'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'डॉक्टर का नाम:' : 'Doctor Name:'}
                </label>
                <input
                  type="text"
                  value={details.doctorName}
                  onChange={(e) => setDetails({ ...details, doctorName: e.target.value })}
                  className="w-full p-1.5 bg-white border border-stone-400 font-sans"
                  placeholder="Dr. Rajesh Kumar Yadav"
                />
              </div>

              <div>
                <label className="font-mono text-red-800 font-bold block mb-1">
                  {isHindi ? 'डॉक्टर रजिस्ट्रेशन (SMC.......):' : 'Doctor Registration (SMC.......):'}
                </label>
                <input
                  type="text"
                  value={details.doctorRegistrationSMC}
                  onChange={(e) => setDetails({ ...details, doctorRegistrationSMC: e.target.value })}
                  className="w-full p-1.5 bg-white border-2 border-red-500 font-mono font-bold text-red-900"
                  placeholder="SMC-48291"
                />
              </div>

              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'डिग्री / पद:' : 'Degrees / Qualifications:'}
                </label>
                <input
                  type="text"
                  value={details.doctorDegree}
                  onChange={(e) => setDetails({ ...details, doctorDegree: e.target.value })}
                  className="w-full p-1.5 bg-white border border-stone-400 font-sans"
                  placeholder="M.B.B.S., M.D. (Internal Medicine)"
                />
              </div>

              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'अस्पताल / क्लिनिक नाम:' : 'Hospital / Clinic Header:'}
                </label>
                <input
                  type="text"
                  value={details.hospitalClinicName}
                  onChange={(e) => setDetails({ ...details, hospitalClinicName: e.target.value })}
                  className="w-full p-1.5 bg-white border border-stone-400 font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-amber-200">
              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'मरीज का नाम (Name of Patient):' : 'Name of Patient:'}
                </label>
                <input
                  type="text"
                  value={details.patientName}
                  onChange={(e) => setDetails({ ...details, patientName: e.target.value })}
                  className="w-full p-1.5 bg-white border-2 border-stone-800 font-sans font-bold"
                  placeholder="Shri / Smt. Rameshwar Sharma"
                />
              </div>

              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'आयु / लिंग (Age / Gender):' : 'Age / Gender:'}
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={details.patientAge}
                    onChange={(e) => setDetails({ ...details, patientAge: e.target.value })}
                    className="w-1/2 p-1.5 bg-white border border-stone-400 font-sans"
                    placeholder="48 Yrs"
                  />
                  <select
                    value={details.patientGender}
                    onChange={(e) => setDetails({ ...details, patientGender: e.target.value as any })}
                    className="w-1/2 p-1.5 bg-white border border-stone-400 font-sans"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-mono text-emerald-800 font-bold block mb-1">
                  {isHindi ? 'व्हाट्सएप फोन नंबर:' : 'WhatsApp Mobile No:'}
                </label>
                <input
                  type="text"
                  value={details.patientPhone || ''}
                  onChange={(e) => setDetails({ ...details, patientPhone: e.target.value })}
                  className="w-full p-1.5 bg-white border border-emerald-500 font-mono text-emerald-950 font-bold"
                  placeholder="+91-9876543210"
                />
              </div>

              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'तारीख (Date):' : 'Prescription Date:'}
                </label>
                <input
                  type="text"
                  value={details.date}
                  onChange={(e) => setDetails({ ...details, date: e.target.value })}
                  className="w-full p-1.5 bg-white border border-stone-400 font-sans"
                />
              </div>

              <div>
                <label className="font-mono text-stone-700 font-bold block mb-1">
                  {isHindi ? 'OPD पर्ची संख्या:' : 'OPD Slip No.:'}
                </label>
                <input
                  type="text"
                  value={details.opdNumber}
                  onChange={(e) => setDetails({ ...details, opdNumber: e.target.value })}
                  className="w-full p-1.5 bg-white border border-stone-400 font-sans"
                />
              </div>
            </div>

            {/* Provisional Diagnosis Customizer */}
            <div className="pt-2 border-t border-amber-200">
              <label className="font-mono text-red-900 font-bold block mb-1">
                {isHindi ? 'संभावित निदान (Provisional Diagnosis):' : 'Provisional Diagnosis:'}
              </label>
              <input
                type="text"
                value={details.provisionalDiagnosis}
                onChange={(e) => setDetails({ ...details, provisionalDiagnosis: e.target.value })}
                className="w-full p-1.5 bg-white border-2 border-stone-700 font-sans font-semibold text-stone-900"
              />
            </div>

            {/* Symptoms Editor */}
            <div className="pt-2 border-t border-amber-200">
              <label className="font-mono text-stone-800 font-bold block mb-1">
                {isHindi ? 'लक्षण व शिकायतें (Symptoms / Complaints):' : 'Symptoms / Complaints List:'}
              </label>
              <div className="space-y-1 mb-2">
                {details.symptomsAndComplaints.map((sym, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 bg-white p-1 border border-stone-300">
                    <span className="font-mono text-[10px] text-stone-500 w-5 text-center">{idx + 1}.</span>
                    <input
                      type="text"
                      value={sym}
                      onChange={(e) => {
                        const updated = [...details.symptomsAndComplaints];
                        updated[idx] = e.target.value;
                        setDetails({ ...details, symptomsAndComplaints: updated });
                      }}
                      className="flex-1 p-1 bg-transparent border-none text-xs text-stone-900 font-sans focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(idx)}
                      className="p-1 text-stone-400 hover:text-red-700"
                      title="Remove symptom"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Symptom Item */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newSymptomText}
                  onChange={(e) => setNewSymptomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSymptom();
                    }
                  }}
                  placeholder={
                    isHindi
                      ? 'नया लक्षण या शिकायत जोड़ें... (उदा: छाती में भारीपन)'
                      : 'Add symptom / clinical complaint (e.g., Shortness of breath on exertion)...'
                  }
                  className="flex-1 p-1 bg-white border border-stone-400 font-sans text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddSymptom}
                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs flex items-center gap-1 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Toggle: In place of Signature Doctor Name can be added */}
            <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-medium text-stone-900">
                <input
                  type="checkbox"
                  checked={details.showDoctorNameInPlaceOfSignature}
                  onChange={(e) =>
                    setDetails({
                      ...details,
                      showDoctorNameInPlaceOfSignature: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-red-700"
                />
                <span>
                  {isHindi
                    ? 'हस्ताक्षर के स्थान पर डॉक्टर का नाम प्रदर्शित करें (In place of Signature Doctor Name can be added)'
                    : 'Show Doctor Name in place of physical signature (NMC / SMC Digitally Verified Prescriber)'}
                </span>
              </label>
            </div>
          </div>
        )}

        {/* =========================================================================
            ACTUAL PRESCRIPTION LETTER PAD (Ready for display and standard A4 printing)
            ========================================================================= */}
        <div
          ref={letterPadRef}
          className="p-6 sm:p-8 md:p-10 bg-white font-serif text-stone-900 print:p-6 print:m-0 print:border-none"
        >
          {/* Header Section: Doctor & Clinic Letter Pad Heading */}
          <div className="border-b-4 border-stone-900 pb-4 mb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              {/* Doctor Details */}
              <div className="space-y-0.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif tracking-tight">
                  {details.doctorName}
                </h1>
                <p className="text-xs sm:text-sm font-sans font-semibold text-stone-800">
                  {details.doctorDegree}
                </p>
                <p className="text-xs font-sans text-stone-600">
                  {details.doctorDesignation}
                </p>
                {/* Doctor Registration SMC prominently highlighted as requested */}
                <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 border border-red-400 font-mono text-xs sm:text-sm font-bold text-red-950">
                  <Stethoscope className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span>
                    State Medical Council Regn: <strong className="text-red-700 underline font-black">{details.doctorRegistrationSMC}</strong>
                  </span>
                </div>
              </div>

              {/* Clinic / Health Center & Emergency Contact */}
              <div className="text-left sm:text-right font-sans text-xs space-y-1">
                <div className="font-bold text-stone-900 text-sm font-serif">
                  {details.hospitalClinicName}
                </div>
                <div className="text-stone-600 max-w-xs">
                  {details.clinicAddress}
                </div>
                <div className="font-mono text-stone-700">
                  Ph / Helpline: <span className="font-semibold">{details.contactNumber}</span>
                </div>
                <div className="text-[11px] text-stone-500 font-mono">
                  Consultation: 9:00 AM - 2:00 PM | 5:00 PM - 8:00 PM
                </div>
              </div>
            </div>
          </div>

          {/* Patient Information Strip */}
          <div className="bg-stone-50 border-2 border-stone-800 p-3 sm:p-4 mb-5 font-sans text-xs sm:text-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              <div>
                <span className="text-stone-500 font-mono text-[11px] block uppercase">
                  {isHindi ? 'मरीज का नाम (Patient Name):' : 'Name of Patient:'}
                </span>
                <span className="font-bold text-stone-950 text-sm sm:text-base border-b border-dotted border-stone-800 inline-block pb-0.5 w-full">
                  {details.patientName}
                </span>
              </div>

              <div>
                <span className="text-stone-500 font-mono text-[11px] block uppercase">
                  {isHindi ? 'आयु / लिंग (Age / Sex):' : 'Age / Sex:'}
                </span>
                <span className="font-bold text-stone-900 border-b border-dotted border-stone-800 inline-block pb-0.5 w-full">
                  {details.patientAge} / {details.patientGender}
                </span>
              </div>

              <div>
                <span className="text-stone-500 font-mono text-[11px] block uppercase">
                  {isHindi ? 'तारीख (Date):' : 'Date:'}
                </span>
                <span className="font-bold text-stone-900 font-mono border-b border-dotted border-stone-800 inline-block pb-0.5 w-full">
                  {details.date}
                </span>
              </div>

              <div>
                <span className="text-stone-500 font-mono text-[11px] block uppercase">
                  {isHindi ? 'OPD पर्ची सं.:' : 'OPD / Slip No.:'}
                </span>
                <span className="font-bold text-stone-900 font-mono border-b border-dotted border-stone-800 inline-block pb-0.5 w-full">
                  {details.opdNumber}
                </span>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="mt-2.5 pt-2 border-t border-stone-300 flex flex-wrap items-center justify-between gap-x-5 gap-y-1 font-mono text-xs text-stone-700">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span><strong>BP:</strong> {details.vitals.bloodPressure || '120/80 mmHg'}</span>
                <span><strong>Pulse:</strong> {details.vitals.pulse || '74 bpm'}</span>
                <span><strong>Weight:</strong> {details.vitals.weight || '68 kg'}</span>
                <span><strong>Sugar:</strong> {details.vitals.bloodSugar || 'RBS 128 mg/dL'}</span>
              </div>
              {details.patientPhone && (
                <div className="text-emerald-800 font-sans text-xs flex items-center gap-1 font-bold">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp: {details.patientPhone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Symptoms / Complaints must be there as requested */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-stone-900 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                1. Chief Complaints & Symptoms
              </span>
              <span className="text-xs font-sans text-stone-600 italic">
                (लक्षण व मुख्य शिकायतें)
              </span>
            </div>
            <div className="bg-amber-50/50 border border-stone-300 p-3">
              <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm font-sans text-stone-800">
                {details.symptomsAndComplaints.map((sym, idx) => (
                  <li key={idx} className="leading-snug">
                    <span className="font-medium">{sym}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Section 2: Thereafter Provisional Diagnosis must be there as requested */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 bg-red-800 text-white font-mono text-xs font-bold uppercase tracking-wider">
                2. Provisional Diagnosis
              </span>
              <span className="text-xs font-sans text-stone-600 italic">
                (संभावित नैदानिक निष्कर्ष)
              </span>
            </div>
            <div className="bg-red-50/70 border-2 border-red-300 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-base sm:text-lg font-bold font-serif text-red-950 block">
                  {details.provisionalDiagnosis}
                </span>
                <span className="text-xs font-sans text-stone-600 block mt-0.5">
                  Severity Grading: <strong className="text-stone-800">{prescription.severityLevel}</strong> | Category: <strong className="text-stone-800">{prescription.category}</strong>
                </span>
              </div>
              <div className="text-right sm:self-center shrink-0">
                <span className="inline-block px-2 py-1 bg-stone-900 text-amber-300 font-mono text-[11px] font-bold">
                  Ref: {prescription.golwalaReference || 'Golwala Medicine Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Thereafter Treatment Prescription (Rx) */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2 pb-1 border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-serif text-red-800 italic">℞</span>
                <span className="font-mono font-bold text-sm uppercase tracking-wider text-stone-900">
                  3. Treatment Prescription (दवा पर्चा)
                </span>
              </div>
              <div className="text-xs font-mono text-stone-500 italic">
                [Generic drug salt with dosage, schedule & duration]
              </div>
            </div>

            {/* Prescribed Medications Table */}
            <div className="border border-stone-800 overflow-hidden font-sans">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-white font-mono text-[11px] uppercase tracking-wider">
                    <th className="p-2 border-r border-stone-700 w-8 text-center">#</th>
                    <th className="p-2 border-r border-stone-700">Generic Drug Salt & Strength</th>
                    <th className="p-2 border-r border-stone-700 w-24">Dosage / Form</th>
                    <th className="p-2 border-r border-stone-700 w-28">Frequency & Timing</th>
                    <th className="p-2 border-r border-stone-700 w-20">Duration</th>
                    <th className="p-2">Patient Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-300">
                  {prescription.rxMedications.map((med, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}>
                      <td className="p-2 font-mono font-bold text-center border-r border-stone-200">
                        {idx + 1}
                      </td>
                      <td className="p-2 border-r border-stone-200">
                        <div className="font-bold text-stone-950 text-xs sm:text-sm uppercase tracking-wide">
                          {med.genericSalt}
                        </div>
                        <div className="font-mono text-stone-600 text-[11px] font-semibold mt-0.5">
                          Strength: <span className="text-stone-900">{med.strength}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 font-sans mt-0.5">
                          Commercial Brands: <em>{med.brandExamples}</em>
                        </div>
                      </td>
                      <td className="p-2 border-r border-stone-200">
                        <span className="inline-block px-1.5 py-0.5 bg-stone-200 text-stone-800 font-mono font-bold text-[10px] uppercase">
                          {med.dosageForm}
                        </span>
                        <div className="text-[11px] text-stone-600 mt-1">{med.strength}</div>
                      </td>
                      <td className="p-2 border-r border-stone-200">
                        <div className="font-mono font-black text-red-900 text-xs">
                          {med.frequency}
                        </div>
                        <div className="text-[11px] text-stone-700 font-medium mt-0.5">
                          {med.timing}
                        </div>
                      </td>
                      <td className="p-2 font-mono font-bold text-stone-900 border-r border-stone-200">
                        {med.duration}
                      </td>
                      <td className="p-2 text-stone-800">
                        <div className="text-[11px] font-medium leading-relaxed">{med.instructions}</div>
                        {med.golwalaNote && (
                          <div className="mt-1 text-[10px] text-amber-900 bg-amber-50 p-1 border-l-2 border-amber-500">
                            <strong>Golwala Pearl:</strong> {med.golwalaNote}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Investigations & Non-Pharmacological Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 text-xs font-sans">
            {/* Investigations Advised */}
            <div className="border border-stone-300 p-3 bg-stone-50">
              <h4 className="font-mono font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Investigations Advised (जांचें):</span>
              </h4>
              <ul className="space-y-1 text-stone-800">
                {prescription.mandatoryInvestigations.map((inv, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-700 font-bold">•</span>
                    <span>{inv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Pharmacological Advice & Diet */}
            <div className="border border-stone-300 p-3 bg-stone-50">
              <h4 className="font-mono font-bold text-stone-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dietary & Lifestyle Advice (परहेज व सलाह):</span>
              </h4>
              <ul className="space-y-1 text-stone-800">
                {prescription.nonPharmAdvice.map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">•</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Emergency Red Flags Notice */}
          <div className="bg-red-50 border border-red-300 p-2.5 mb-6 text-xs text-red-950 font-sans flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Emergency Warning Signs (तत्काल अस्पताल संपर्क करें): </span>
              {prescription.redFlagsAndHospitalize.join('; ')}.
            </div>
          </div>

          {/* Bottom Section: Follow-up & Doctor Signatory Block */}
          <div className="pt-4 border-t-2 border-stone-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            {/* Left Side: Follow-up & Standard Note with Transfer Barcode */}
            <div className="space-y-2 text-xs font-sans text-stone-700 max-w-sm">
              <div className="font-bold text-stone-900">
                Follow-up: <span className="font-normal">Re-evaluate after {prescription.rxMedications[0]?.duration || '5-7 days'} or SOS in case of persistent distress</span>
              </div>
              <div className="flex items-center gap-2 p-1.5 bg-stone-50 border border-stone-200">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=${encodeURIComponent(`https://ais-pre-2hkwtujqhst3gqnhtivnrb-236247641087.asia-southeast1.run.app?source=whatsapp_transfer&doctor=${encodeURIComponent(details.doctorName)}&reg=${encodeURIComponent(details.doctorRegistrationSMC)}`)}`}
                  alt="Rx Verification Barcode"
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div className="text-[9px] font-mono text-stone-600 leading-tight">
                  <div className="font-bold text-stone-900">Digital Rx & WhatsApp App Transfer</div>
                  <div>Scan via WhatsApp camera to install app</div>
                  <div>SMC Reg: {details.doctorRegistrationSMC}</div>
                </div>
              </div>
              <div className="text-[10px] text-stone-400 font-mono">
                Printed on: {details.date} | Valid for outpatient dispensing.
              </div>
            </div>

            {/* Right Side: Doctor Signatory Block */}
            <div className="text-right sm:min-w-[280px]">
              {details.showDoctorNameInPlaceOfSignature ? (
                /* Doctor name added in place of signature as requested */
                <div className="space-y-1 border-t-2 border-stone-800 pt-2 inline-block text-right">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
                    Doctor Name (In Place of Signature):
                  </div>
                  <div className="text-base sm:text-lg font-extrabold text-stone-950 font-serif">
                    {details.doctorName}
                  </div>
                  <div className="font-mono text-xs font-bold text-red-700">
                    Regn. No.: {details.doctorRegistrationSMC}
                  </div>
                  <div className="text-xs text-stone-600 font-sans">
                    {details.doctorDegree}
                  </div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 font-mono text-[10px] font-semibold mt-1">
                    <CheckSquare className="w-3 h-3 text-emerald-600" />
                    <span>Digitally Authorized Registered Prescriber</span>
                  </div>
                </div>
              ) : (
                /* Standard physical signature space */
                <div className="space-y-1 inline-block text-right">
                  <div className="h-12 border-b-2 border-stone-800 w-48 ml-auto"></div>
                  <div className="text-xs font-mono text-stone-600">Signature / Seal</div>
                  <div className="text-sm font-bold text-stone-900 font-serif">
                    {details.doctorName}
                  </div>
                  <div className="font-mono text-xs font-bold text-red-700">
                    Regn. No.: {details.doctorRegistrationSMC}
                  </div>
                </div>
              )}
            </div>

            {/* Subtle Clinical Freeware & Verification Footnote */}
            <div className="mt-4 pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between text-[10px] text-stone-500 font-mono">
              <span>AI Doctor Personal Assistant · Freeware Edition (Distributed by Owner)</span>
              <span>Ref: Golwala Prescriber Protocol · SMC Outpatient Pad</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls (Hidden on Print) */}
        <div className="bg-stone-100 border-t border-stone-300 px-6 py-3 flex flex-wrap justify-between items-center gap-3 print:hidden shrink-0">
          <div className="text-xs text-stone-600 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>
              {isHindi
                ? 'प्रारूप: SMC डॉक्टर पंजीकरण, मरीज का नाम, लक्षण, संभावित निदान, दवा पर्चा व PDF / व्हाट्सएप'
                : 'SMC Doctor Regn, Patient Name, Symptoms, Provisional Diagnosis, Rx & PDF / WhatsApp Enabled'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Action: Download PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{isGeneratingPdf ? 'Generating...' : (isHindi ? 'PDF डाउनलोड' : 'Download PDF')}</span>
            </button>

            {/* Quick Action: WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              disabled={isSharingWhatsApp}
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {isSharingWhatsApp ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span>{isSharingWhatsApp ? 'Preparing...' : (isHindi ? 'व्हाट्सएप भेजें' : 'Send WhatsApp')}</span>
            </button>

            {/* Print Slip */}
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? 'प्रिंट पर्चा' : 'Print Slip'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-stone-300 hover:bg-stone-400 text-stone-800 font-mono text-xs font-bold transition-colors"
            >
              {isHindi ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
