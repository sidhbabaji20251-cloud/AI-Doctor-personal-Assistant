import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchStandardPrescriptions } from '../services/api';
import { StandardPrescription, StandardPrescriptionData, GroundingSource } from '../types';
import { PrescriptionLetterPadModal } from './PrescriptionLetterPadModal';
import { getDefaultSymptomsForCondition } from '../utils/prescriptionLetterPad';
import { VoiceInputButton } from './VoiceInputButton';
import { AudioReaderButton } from './AudioReaderButton';
import {
  ClipboardList,
  FileText,
  Search,
  BookOpen,
  Copy,
  Check,
  Printer,
  Bookmark,
  AlertTriangle,
  Info,
  ShieldCheck,
  Stethoscope,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Pill,
  Sparkles,
  ArrowRight,
  Filter,
  RefreshCw,
  Download,
  Share2,
} from 'lucide-react';

interface StandardPrescriptionViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const StandardPrescriptionView: React.FC<StandardPrescriptionViewProps> = ({ onNavigateTab }) => {
  const { language, addBookmark, bookmarks, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [prescriptions, setPrescriptions] = useState<StandardPrescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [metadata, setMetadata] = useState<{ sourceTextbook: string; lastUpdated: string; disclaimer: string } | null>(null);

  // Expanded prescription details state
  const [expandedPrescriptionId, setExpandedPrescriptionId] = useState<string | null>('dm-mild');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printModalPrescription, setPrintModalPrescription] = useState<StandardPrescription | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Diseases', labelHi: 'सभी रोग' },
    { id: 'Metabolic & Endocrine', labelEn: 'Diabetes & Endocrine', labelHi: 'डायबिटीज व थायराइड' },
    { id: 'Cardiovascular', labelEn: 'Hypertension, CAD & HF', labelHi: 'बीपी, सीएडी व हार्ट फेलियर' },
    { id: 'Respiratory', labelEn: 'Asthma, COPD, Pneumonia', labelHi: 'अस्थमा, सीओपीडी व श्वसन' },
    { id: 'Infectious Disease', labelEn: 'Typhoid, TB, Malaria, Dengue', labelHi: 'टाइफाइड, टीबी, मलेरिया, डेंगू' },
    { id: 'Neurology', labelEn: 'Migraine, Epilepsy, Bell\'s Palsy', labelHi: 'माइग्रेन, मिर्गी व फेशियल पाल्सी' },
    { id: 'Nephrology & Urology', labelEn: 'UTI, Renal Colic, BPH', labelHi: 'यूटीआई, पथरी व प्रोस्टेट' },
    { id: 'Musculoskeletal', labelEn: 'PIVD, Gout, Arthritis', labelHi: 'स्लिप डिस्क, गाउट व गठिया' },
    { id: 'ENT & Ophthalmology', labelEn: 'Glaucoma, Sinusitis, Vertigo', labelHi: 'साइनस, चक्कर व ग्लूकोमा' },
    { id: 'Gastroenterology', labelEn: 'GERD, Peptic Ulcer, Cirrhosis, Piles', labelHi: 'एसिडिटी, अल्सर, सिरोसिस व पाइल्स' },
    { id: 'Reproductive & Sexual Health', labelEn: 'ED & PID', labelHi: 'यौन स्वास्थ्य व पीआईडी' },
    { id: 'Hematology', labelEn: 'Iron Deficiency Anemia', labelHi: 'आयरन की कमी / एनीमिया' },
  ];

  const quickDiseases = [
    { label: 'Diabetes (Mild)', query: 'Diabetes Mellitus Type 2 (Mild' },
    { label: 'Diabetes (Moderate)', query: 'Diabetes Mellitus Type 2 (Moderate' },
    { label: 'Diabetes (Severe)', query: 'Diabetes Mellitus Type 2 (Severe' },
    { label: 'Hypertension (Mild)', query: 'Essential Hypertension (Mild' },
    { label: 'Hypertension (Moderate)', query: 'Essential Hypertension (Moderate' },
    { label: 'Hypertension (Severe)', query: 'Essential Hypertension (Severe' },
    { label: 'Asthma (Moderate)', query: 'Bronchial Asthma (Moderate' },
    { label: 'Asthma (Severe)', query: 'Bronchial Asthma (Severe' },
    { label: 'COPD', query: 'Chronic Obstructive Pulmonary Disease' },
    { label: 'Enteric Fever (Typhoid)', query: 'Enteric Fever' },
    { label: 'CAD / Angina', query: 'Coronary Artery Disease' },
    { label: 'Heart Failure (CHF)', query: 'Congestive Heart Failure' },
    { label: 'Atrial Fibrillation', query: 'Atrial Fibrillation' },
    { label: 'Pneumonia', query: 'Pneumonia' },
    { label: 'Pulmonary TB', query: 'Pulmonary Tuberculosis' },
    { label: 'UTI (Cystitis)', query: 'Urinary Tract Infection' },
    { label: 'PIVD (Sciatica)', query: 'Prolapsed Intervertebral Disc' },
    { label: 'Migraine', query: 'Migraine' },
    { label: 'Epilepsy', query: 'Epilepsy' },
    { label: 'Glaucoma', query: 'Glaucoma' },
    { label: 'Sinusitis', query: 'Sinusitis' },
    { label: 'URI (Common Cold)', query: 'Upper Respiratory Infection' },
    { label: 'Allergic Rhinitis', query: 'Allergic Rhinitis' },
    { label: 'Diabetic Foot', query: 'Diabetic Foot' },
    { label: 'Hyperthyroidism', query: 'Hyperthyroidism' },
    { label: 'Hypothyroidism', query: 'Hypothyroidism' },
    { label: 'Erectile Dysfunction', query: 'Erectile Dysfunction' },
    { label: 'PID', query: 'Pelvic Inflammatory Disease' },
    { label: 'Chronic Amoebiasis', query: 'Chronic Intestinal Amoebiasis' },
    { label: 'Renal Colic (Calculus)', query: 'Renal Colic' },
    { label: 'Peptic Ulcer (H. pylori)', query: 'Peptic Ulcer' },
    { label: 'GERD & Dyspepsia', query: 'Gastroesophageal Reflux Disease' },
    { label: 'Cirrhosis & Ascites', query: 'Cirrhosis of Liver' },
    { label: 'Acute Gout (Podagra)', query: 'Acute Gouty Arthritis' },
    { label: 'Rheumatoid Arthritis', query: 'Rheumatoid Arthritis' },
    { label: 'Bell\'s Palsy', query: 'Bell\'s Palsy' },
    { label: 'Vertigo & BPPV', query: 'Vertigo & Labyrinthitis' },
    { label: 'Iron Deficiency Anemia', query: 'Iron Deficiency Anemia' },
    { label: 'Malaria (Vivax & Falciparum)', query: 'Malaria' },
    { label: 'Dengue Fever', query: 'Dengue Fever' },
    { label: 'Scabies', query: 'Scabies & Pediculosis' },
    { label: 'Tinea (Ringworm)', query: 'Tinea Corporis' },
    { label: 'BPH (Prostate)', query: 'Benign Prostatic Hyperplasia' },
    { label: 'Piles & Anal Fissure', query: 'Anal Fissure & Hemorrhoids' },
  ];

  const loadPrescriptions = async (cat = selectedCategory, q = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchStandardPrescriptions(cat, q, language);
      if (response.success && response.data) {
        setPrescriptions(response.data.prescriptions || []);
        setMetadata({
          sourceTextbook: response.data.sourceTextbook,
          lastUpdated: response.data.lastUpdated,
          disclaimer: response.data.disclaimer,
        });
        setSources(response.sources || []);

        if (response.data.prescriptions.length > 0 && !expandedPrescriptionId) {
          setExpandedPrescriptionId(response.data.prescriptions[0].id);
        }

        if (q.trim()) {
          addHistory({
            type: 'standard_prescription',
            query: q,
            preview: `Prescriptions for: ${q} (${response.data.prescriptions.length} protocols found)`,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch standard prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrescriptions(selectedCategory, searchQuery);
  }, [selectedCategory, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadPrescriptions(selectedCategory, searchQuery);
  };

  const handleQuickSelect = (queryText: string) => {
    setSearchQuery(queryText);
    loadPrescriptions('all', queryText);
    setSelectedCategory('all');
  };

  const handleCopyPrescription = (p: StandardPrescription) => {
    const symptoms = getDefaultSymptomsForCondition(p);
    const todayStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const textLines = [
      `===================================================================`,
      `DOCTOR CLINICAL PRESCRIPTION LETTER PAD`,
      `State Medical Council Regn: SMC-48291`,
      `Doctor Name: Dr. Rajesh Kumar Yadav, M.B.B.S., M.D. (Internal Medicine)`,
      `===================================================================`,
      `PATIENT INFORMATION:`,
      `Name of Patient: Shri / Smt. Rameshwar Sharma | Age/Gender: 48 Yrs / Male`,
      `Date: ${todayStr} | OPD Slip: OPD-2026/0491`,
      `-------------------------------------------------------------------`,
      `1. CHIEF COMPLAINTS & SYMPTOMS (लक्षण व शिकायतें):`,
      ...symptoms.map((s, i) => `   (${i + 1}) ${s}`),
      ``,
      `2. PROVISIONAL DIAGNOSIS (संभावित निदान):`,
      `   ${p.diseaseName} (${p.severityLevel})`,
      `   Clinical Reference: ${p.golwalaReference || "Golwala's Clinical Medicine"}`,
      ``,
      `3. ℞ TREATMENT PRESCRIPTION (मानक चिकित्सा नुस्खा):`,
      ...p.rxMedications.map(
        (m, idx) =>
          `   ${idx + 1}. [${m.dosageForm}] ${m.genericSalt.toUpperCase()} (${m.strength})\n` +
          `      Brand Reference: ${m.brandExamples}\n` +
          `      Schedule: ${m.frequency} | Timing: ${m.timing} | Duration: ${m.duration}\n` +
          `      Instructions: ${m.instructions}${m.golwalaNote ? `\n      Golwala Note: ${m.golwalaNote}` : ''}`
      ),
      ``,
      `DIETARY & LIFESTYLE ADVICE:`,
      ...p.nonPharmAdvice.map((a) => `   • ${a}`),
      ``,
      `MANDATORY INVESTIGATIONS:`,
      ...p.mandatoryInvestigations.map((inv) => `   • ${inv}`),
      ``,
      `EMERGENCY ADMISSION RED FLAGS:`,
      ...p.redFlagsAndHospitalize.map((rf) => `   ! ${rf}`),
      `-------------------------------------------------------------------`,
      `DOCTOR NAME (In place of Signature): Dr. Rajesh Kumar Yadav`,
      `Doctor Registration: SMC-48291 (State Medical Council)`,
      `[Digitally Authorized Registered Prescriber]`,
      `===================================================================`,
      `Disclaimer: Clinical educational reference per Golwala. Verify organ functions before dispensing.`,
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedId(p.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleBookmarkPrescription = (p: StandardPrescription) => {
    addBookmark({
      type: 'standard-prescription',
      title: `${p.diseaseName} (${p.severityLevel})`,
      snippet: `${p.category}: ${p.rxMedications.map((m) => m.genericSalt).join(', ')}. Golwala Ref: ${p.golwalaReference}`,
      data: p,
      sources,
    });
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some((b) => b.data?.id === id || b.title.includes(id));
  };

  const filteredPrescriptions = selectedSeverity === 'all'
    ? prescriptions
    : prescriptions.filter((p) => p.severityLevel.toLowerCase() === selectedSeverity.toLowerCase());

  // Narration helper
  const getNarrationText = (p: StandardPrescription) => {
    return `${p.diseaseName}. Severity: ${p.severityLevel}. ${p.clinicalOverview}. Standard prescription medications include: ${p.rxMedications.map((m) => `${m.genericSalt} ${m.strength}, taken ${m.frequency}, ${m.timing}`).join('. ')}. Diet and lifestyle instructions: ${p.nonPharmAdvice.join('. ')}. Emergency warning signs: ${p.redFlagsAndHospitalize.join('. ')}.`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Multicoloured Red Gradient Header as requested */}
      <div className="bg-[#facc15] border-2 border-red-500 rounded-none p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-700 text-white font-mono text-xs uppercase tracking-wider font-bold mb-2">
              <Stethoscope className="w-3.5 h-3.5" />
              Golwala Clinical Prescriber & National Protocols
            </div>
            {/* Header: Standard Prescription with vibrant multicoloured Red gradient */}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif bg-gradient-to-r from-red-800 via-red-600 to-rose-700 bg-clip-text text-transparent">
              Standard Prescription
            </h1>
            <p className="text-stone-900 font-medium text-sm mt-1 max-w-3xl">
              {isHindi
                ? 'डायबिटीज, हाइपरटेंशन, अस्थमा, टाइफाइड, सीएडी, निमोनिया, यूटीआई, पीआईवीडी, माइग्रेन, मिर्गी, ग्लूकोमा, साइनोसाइटिस, डायबिटिक फुट, इरेक्टाइल डिस्फंक्शन, पीआईडी, रीनल कोलिक आदि के लिए गोलवाला प्रेस्क्राइबर आधारित मानक दवा पर्चा।'
                : 'Evidence-based standard prescriptions for Diabetes (Mild, Moderate, Severe), Hypertension, Asthma, Enteric Fever, CAD, Pneumonia, UTI, PIVD, Migraine, Epilepsy, Glaucoma, Sinusitis, URI, Diabetic Foot, Hyperthyroidism, ED, PID, Amoebiasis, Renal Colic & more as per Golwala Prescriber.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              onClick={() => loadPrescriptions(selectedCategory, searchQuery)}
              disabled={loading}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-colors border border-amber-400"
              title="Refresh Prescriptions"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'ताज़ा करें' : 'Refresh'}</span>
            </button>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('drugs')}
                className="px-3 py-2 bg-red-700 hover:bg-red-800 text-white font-mono text-xs flex items-center gap-1.5 transition-colors font-bold shadow-xs"
                title="Go to Drug and substitute search"
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{isHindi ? 'दवा के सस्ते विकल्प' : 'Drug & Substitute'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-3.5 text-stone-600 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? 'रोग या दवा का नाम खोजें (उदा: Diabetes, Hypertension, Asthma, PIVD, Migraine, UTI, Typhoid)...'
                  : 'Search condition or drug salt (e.g., Diabetes, Hypertension, Asthma, Enteric fever, CAD, Pneumonia, UTI, PIVD, Migraine, Epilepsy, Glaucoma, Renal colic)...'
              }
              className="w-full pl-11 pr-24 py-3 bg-white text-stone-900 placeholder-stone-500 border-2 border-stone-800 focus:outline-hidden focus:border-red-600 font-sans text-sm sm:text-base font-medium shadow-xs"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <VoiceInputButton
                onTranscript={(transcript) => {
                  setSearchQuery(transcript);
                  loadPrescriptions(selectedCategory, transcript);
                }}
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                {isHindi ? 'खोजें' : 'Search'}
              </button>
            </div>
          </div>
        </form>

        {/* Quick Click Badges for Specific User Requested Conditions */}
        <div className="mt-3.5 pt-3 border-t border-amber-600/30">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-stone-900 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-red-700" />
            <span>{isHindi ? 'त्वरित मानक पर्चे (Golwala Standard):' : 'Instant Golwala Protocols:'}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
            {quickDiseases.map((qd) => (
              <button
                key={qd.label}
                onClick={() => handleQuickSelect(qd.query)}
                className={`px-2 py-0.5 text-xs font-medium transition-colors border ${
                  searchQuery.toLowerCase().includes(qd.label.toLowerCase().split(' ')[0])
                    ? 'bg-red-800 text-white border-red-900 font-bold'
                    : 'bg-white/80 hover:bg-white text-stone-900 border-stone-400 hover:border-red-600'
                }`}
              >
                {qd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category Pills & Severity Filters */}
      <div className="bg-white border border-stone-200 p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-red-600" />
            {isHindi ? 'चिकित्सा श्रेणी चुनें:' : 'Disease Categories:'}
          </span>

          {/* Severity stage filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="font-mono text-stone-500 mr-1">{isHindi ? 'गंभीरता स्तर:' : 'Severity:'}</span>
            {['all', 'Mild', 'Moderate', 'Severe', 'Acute', 'Standard Protocol'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSelectedSeverity(sev)}
                className={`px-2 py-0.5 text-xs font-mono transition-colors ${
                  selectedSeverity === sev
                    ? 'bg-red-700 text-white font-bold'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {sev === 'all' ? (isHindi ? 'सभी' : 'All') : sev}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-amber-300 font-bold border border-stone-900'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200'
              }`}
            >
              {isHindi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white border border-stone-200 p-12 text-center shadow-xs">
          <div className="animate-spin w-8 h-8 border-3 border-red-700 border-t-transparent mx-auto mb-3" />
          <p className="text-stone-700 font-mono text-sm">
            {isHindi ? 'गोलवाला मानक दवा पर्चा लोड हो रहा है...' : 'Loading Golwala Standard Clinical Prescriptions...'}
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-300 p-6 text-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Error Loading Prescriptions</h4>
              <p className="text-xs mt-1 text-red-700">{error}</p>
              <button
                onClick={() => loadPrescriptions(selectedCategory, searchQuery)}
                className="mt-3 px-3 py-1 bg-red-700 text-white font-mono text-xs font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      ) : filteredPrescriptions.length === 0 ? (
        <div className="bg-white border border-stone-200 p-12 text-center shadow-xs">
          <BookOpen className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-900">
            {isHindi ? 'कोई मानक पर्चा नहीं मिला' : 'No Standard Prescription Found'}
          </h3>
          <p className="text-stone-600 text-sm mt-1 max-w-md mx-auto">
            {isHindi
              ? 'कृपया खोज शब्द बदलें या "सभी रोग" श्रेणी का चयन करें।'
              : 'Try clearing the search query or selecting a different disease category.'}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedSeverity('all');
              loadPrescriptions('all', '');
            }}
            className="mt-4 px-4 py-2 bg-stone-900 text-amber-300 font-mono text-xs font-bold"
          >
            {isHindi ? 'सभी गोलवाला पर्चे देखें' : 'View All Golwala Prescriptions'}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="flex items-center justify-between text-xs font-mono text-stone-600 px-1">
            <span>
              Showing <strong className="text-stone-900">{filteredPrescriptions.length}</strong> standard clinical protocols
            </span>
            <span>
              Source: <strong className="text-red-700 font-serif">Golwala Prescriber 25th Edition</strong>
            </span>
          </div>

          {/* List of Prescriptions */}
          <div className="space-y-6">
            {filteredPrescriptions.map((prescription) => {
              const isExpanded = expandedPrescriptionId === prescription.id;
              const severityColor =
                prescription.severityLevel === 'Severe'
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : prescription.severityLevel === 'Moderate'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : prescription.severityLevel === 'Mild'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : prescription.severityLevel === 'Acute'
                  ? 'bg-red-100 text-red-800 border-red-300'
                  : 'bg-indigo-100 text-indigo-800 border-indigo-300';

              return (
                <div
                  key={prescription.id}
                  className={`bg-white border-2 transition-all shadow-xs ${
                    isExpanded ? 'border-red-600 ring-2 ring-red-600/10' : 'border-stone-300 hover:border-stone-400'
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 text-xs font-mono font-bold uppercase border ${severityColor}`}>
                            {prescription.severityLevel}
                          </span>
                          <span className="px-2 py-0.5 text-xs font-mono text-stone-600 bg-white border border-stone-200">
                            {prescription.category}
                          </span>
                          <span className="text-xs text-stone-500 font-mono">
                            {prescription.rxMedications.length} Rx Medications
                          </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                          {prescription.diseaseName}
                        </h2>
                        {prescription.hindiName && (
                          <div className="text-sm font-medium text-red-800 mt-0.5">
                            {prescription.hindiName}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-stone-600 font-mono mt-1">
                          <BookOpen className="w-3.5 h-3.5 text-red-700" />
                          <span>{prescription.golwalaReference}</span>
                        </div>
                      </div>

                      {/* Top Action Buttons */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                        <AudioReaderButton
                          text={getNarrationText(prescription)}
                          label={isHindi ? 'पर्चा सुनें' : 'Listen Rx'}
                        />

                        <button
                          onClick={() => handleCopyPrescription(prescription)}
                          className="px-2.5 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-mono text-xs flex items-center gap-1 font-semibold transition-colors"
                          title="Copy Full Prescription"
                        >
                          {copiedId === prescription.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-stone-600" />
                              <span>Copy Rx</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setPrintModalPrescription(prescription)}
                          className="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs flex items-center gap-1.5 font-bold transition-colors shadow-xs"
                          title="Open Doctor Prescription Letter Pad (SMC Standard) with PDF Download & WhatsApp"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'लेटर पैड / PDF' : 'Pad & PDF'}</span>
                        </button>

                        <button
                          onClick={() => handleBookmarkPrescription(prescription)}
                          className={`p-1.5 border transition-colors ${
                            isBookmarked(prescription.id)
                              ? 'bg-amber-100 border-amber-400 text-amber-900'
                              : 'bg-white hover:bg-stone-100 border-stone-300 text-stone-700'
                          }`}
                          title="Bookmark to Vault"
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked(prescription.id) ? 'fill-current' : ''}`} />
                        </button>

                        <button
                          onClick={() => setExpandedPrescriptionId(isExpanded ? null : prescription.id)}
                          className="p-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 transition-colors"
                          title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-700 mt-3 leading-relaxed border-t border-stone-200 pt-2.5">
                      {prescription.clinicalOverview}
                    </p>
                  </div>

                  {/* Diagnostic Criteria Strip */}
                  {prescription.diagnosticCriteria && prescription.diagnosticCriteria.length > 0 && (
                    <div className="bg-amber-50/60 px-4 sm:px-5 py-2.5 border-b border-amber-200 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                      <span className="font-mono font-bold text-amber-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                        {isHindi ? 'नैदानिक मानदंड (Criteria):' : 'Diagnostic Criteria:'}
                      </span>
                      {prescription.diagnosticCriteria.map((crit, idx) => (
                        <span key={idx} className="text-stone-800 bg-white/90 px-2 py-0.5 border border-amber-300">
                          {crit}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 1. Symptoms / Complaints & 2. Provisional Diagnosis Preview Strip */}
                  <div className="bg-white px-4 sm:px-5 py-2.5 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 border border-stone-300">
                        1. {isHindi ? 'लक्षण (Symptoms):' : 'Symptoms:'}
                      </span>
                      <span className="text-stone-700 font-medium truncate max-w-md">
                        {getDefaultSymptomsForCondition(prescription).slice(0, 2).join('; ')}...
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-red-900 bg-red-50 px-2 py-0.5 border border-red-200">
                        2. {isHindi ? 'संभावित निदान (Prov. Diagnosis):' : 'Prov. Diagnosis:'}
                      </span>
                      <span className="font-bold text-stone-900">
                        {prescription.diseaseName}
                      </span>
                    </div>
                  </div>

                  {/* Rx Medication Table (Always visible or expanded) */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-serif font-black text-red-700">℞</span>
                        <h3 className="font-serif font-bold text-stone-900 text-base sm:text-lg">
                          {isHindi ? 'मानक नुस्खा व दवा सूची' : 'Prescribed Medications (Standard Regimen)'}
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-stone-500">
                        NMC Generic INN + Brand Reference
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-stone-300">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-stone-900 text-amber-300 font-mono text-xs uppercase tracking-wider">
                            <th className="py-2.5 px-3 border-r border-stone-700 w-12 text-center">#</th>
                            <th className="py-2.5 px-3 border-r border-stone-700">Generic Salt (INN) & Class</th>
                            <th className="py-2.5 px-3 border-r border-stone-700">Standard Brand Example</th>
                            <th className="py-2.5 px-3 border-r border-stone-700 text-center">Dosage & Strength</th>
                            <th className="py-2.5 px-3 border-r border-stone-700 text-center">Frequency</th>
                            <th className="py-2.5 px-3 border-r border-stone-700">Timing & Duration</th>
                            <th className="py-2.5 px-3">Patient Instructions & Golwala Pearl</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-200">
                          {prescription.rxMedications.map((med, index) => (
                            <tr
                              key={med.id}
                              className={index % 2 === 0 ? 'bg-white hover:bg-amber-50/40' : 'bg-stone-50 hover:bg-amber-50/40'}
                            >
                              <td className="py-3 px-3 font-mono font-bold text-red-700 text-center border-r border-stone-200">
                                {index + 1}
                              </td>

                              <td className="py-3 px-3 border-r border-stone-200">
                                <div className="font-bold text-stone-900 text-sm font-sans">
                                  {med.genericSalt}
                                </div>
                                <div className="text-xs text-stone-500 font-mono mt-0.5">
                                  {med.drugCategory}
                                </div>
                              </td>

                              <td className="py-3 px-3 border-r border-stone-200">
                                <span className="font-semibold text-red-900 bg-red-50 px-2 py-0.5 border border-red-200 font-mono text-xs">
                                  {med.brandExamples}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center border-r border-stone-200 font-mono font-bold text-stone-800">
                                {med.dosageForm} {med.strength}
                              </td>

                              <td className="py-3 px-3 text-center border-r border-stone-200">
                                <span className="px-2 py-1 bg-stone-900 text-amber-300 font-mono font-bold text-xs inline-block">
                                  {med.frequency}
                                </span>
                              </td>

                              <td className="py-3 px-3 border-r border-stone-200">
                                <div className="font-semibold text-stone-800 text-xs">
                                  {med.timing}
                                </div>
                                <div className="text-stone-500 text-xs font-mono mt-0.5">
                                  Duration: <strong className="text-stone-700">{med.duration}</strong>
                                </div>
                              </td>

                              <td className="py-3 px-3 leading-relaxed">
                                <div className="text-stone-800 text-xs">
                                  {med.instructions}
                                </div>
                                {med.golwalaNote && (
                                  <div className="mt-1 p-1.5 bg-amber-50 border-l-2 border-amber-600 text-[11px] text-amber-900 font-serif italic">
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

                  {/* Expanded Sections: Advice, Investigations, Red Flags, Pearls */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-stone-200 pt-4 bg-stone-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Non-Pharmacological Advice */}
                        <div className="bg-white border border-stone-200 p-4">
                          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            {isHindi ? 'गैर-दवा व आहार परामर्श (Non-Pharm Advice):' : 'Non-Pharmacological & Dietary Advice:'}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-stone-700">
                            {prescription.nonPharmAdvice.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Mandatory Investigations */}
                        <div className="bg-white border border-stone-200 p-4">
                          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5 mb-2.5">
                            <ClipboardList className="w-4 h-4 text-indigo-600" />
                            {isHindi ? 'अनिवार्य जांचें (Mandatory Investigations):' : 'Mandatory Investigations to Order:'}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-stone-700">
                            {prescription.mandatoryInvestigations.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-indigo-600 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Red Flags & Hospitalization */}
                        <div className="bg-rose-50 border border-rose-200 p-4">
                          <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1.5 mb-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-600" />
                            {isHindi ? 'आपातकालीन चेतावनी व भर्ती के लक्षण (Red Flags):' : 'Red Flags & Emergency Admission Criteria:'}
                          </h4>
                          <ul className="space-y-1.5 text-xs text-rose-950">
                            {prescription.redFlagsAndHospitalize.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 font-medium">
                                <span className="text-rose-600 font-bold font-mono">!</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Clinical Pearls & Contraindications */}
                        <div className="bg-amber-50/70 border border-amber-200 p-4 space-y-3">
                          <div>
                            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-1.5">
                              <BookOpen className="w-4 h-4 text-amber-700" />
                              {isHindi ? 'गोलवाला क्लिनिकल पर्ल्स (Clinical Pearls):' : 'Golwala Clinical Pearls:'}
                            </h4>
                            <ul className="space-y-1 text-xs text-amber-950">
                              {prescription.clinicalPearls.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-amber-700 font-bold">*</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t border-amber-200 pt-2">
                            <h5 className="font-mono text-[11px] font-bold uppercase tracking-wider text-red-900 mb-1">
                              {isHindi ? 'सावधानियां व निषेध (Contraindications):' : 'Absolute Contraindications:'}
                            </h5>
                            <ul className="space-y-0.5 text-xs text-red-900 font-medium">
                              {prescription.contraindications.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                  <span className="text-red-600 font-bold">✕</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions Inside Card */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
                        <div className="text-xs text-stone-500 font-mono">
                          NMC Guideline: Prescribe using generic names in legible capital letters.
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPrintModalPrescription(prescription)}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 border border-amber-400 transition-colors"
                            title="Generate and print full clinical letter pad, Download PDF, or Share on WhatsApp"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'लेटर पैड व PDF (SMC)' : 'Prescription Letter Pad / PDF (SMC)'}</span>
                          </button>

                          {onNavigateTab && (
                            <button
                              onClick={() => {
                                onNavigateTab('drugs');
                              }}
                              className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-1"
                            >
                              <Pill className="w-3.5 h-3.5" />
                              <span>{isHindi ? 'सस्ते विकल्प देखें' : 'Compare Generic Prices'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sources and Textbook Attribution */}
          {sources.length > 0 && (
            <div className="bg-stone-50 border border-stone-200 p-4 mt-6">
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                Textbook & National Regulatory References:
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white border border-stone-200 hover:border-red-600 transition-colors flex items-center justify-between text-stone-800 group"
                  >
                    <span className="truncate pr-2 font-medium group-hover:text-red-700">{src.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-red-700 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Disclaimer */}
          {metadata?.disclaimer && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-xs text-amber-900 leading-relaxed">
              <strong>Clinical Disclaimer:</strong> {metadata.disclaimer}
            </div>
          )}
        </div>
      )}

      {/* Printable Prescription Letter Pad Modal */}
      {printModalPrescription && (
        <PrescriptionLetterPadModal
          prescription={printModalPrescription}
          language={language}
          onClose={() => setPrintModalPrescription(null)}
        />
      )}
    </div>
  );
};
