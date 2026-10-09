import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDrugSubstitutes } from '../services/api';
import { DrugSubstituteData, DrugSubstituteItem, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { AudioReaderButton } from './AudioReaderButton';
import {
  Pill,
  Search,
  IndianRupee,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Bookmark,
  Share2,
  Copy,
  ExternalLink,
  Info,
  Building,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';

const COMMON_SALT_PRESETS = [
  { salt: 'Paracetamol 650mg', labelEn: 'Paracetamol 650mg', labelHi: 'पैरासिटामोल 650mg' },
  { salt: 'Amoxicillin + Potassium Clavulanate 625mg', labelEn: 'Amoxy-Clav 625mg', labelHi: 'एमोक्सिसिलिन+क्लैव 625mg' },
  { salt: 'Metformin 500mg', labelEn: 'Metformin 500mg', labelHi: 'मेटफॉर्मिन 500mg' },
  { salt: 'Pantoprazole 40mg', labelEn: 'Pantoprazole 40mg', labelHi: 'पेंटोप्राजोल 40mg' },
  { salt: 'Telmisartan 40mg', labelEn: 'Telmisartan 40mg', labelHi: 'टेल्मीसार्टन 40mg' },
  { salt: 'Atorvastatin 10mg', labelEn: 'Atorvastatin 10mg', labelHi: 'एटोरवास्टेटिन 10mg' },
  { salt: 'Montelukast 10mg + Levocetirizine 5mg', labelEn: 'Montelukast + Levocet', labelHi: 'मोंटेलुकास्ट + लेवोसेट' },
  { salt: 'Azithromycin 500mg', labelEn: 'Azithromycin 500mg', labelHi: 'एजिथ्रोमाइसिन 500mg' },
];

export const DrugSubstituteView: React.FC = () => {
  const { language, addBookmark, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [searchQuery, setSearchQuery] = useState('Paracetamol 650mg');
  const [data, setData] = useState<DrugSubstituteData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'cheapest' | 'highest' | 'janAushadhiOnly'>('cheapest');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedId, setBookmarkedId] = useState<string | null>(null);

  const loadDrugSubstitutes = async (saltToSearch: string) => {
    if (!saltToSearch.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchDrugSubstitutes(saltToSearch.trim(), language);
      if (response.success && response.data) {
        setData(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'drug_substitute',
          query: saltToSearch,
          preview: `${response.data.matchedSaltStandardName} - ${response.data.substitutes.length} substitutes found`,
        });
      } else {
        setError(response.error || (isHindi ? 'दवा विकल्प लोड करने में असमर्थ' : 'Unable to find drug substitutes'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrugSubstitutes(searchQuery);
  }, [language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadDrugSubstitutes(searchQuery.trim());
    }
  };

  const handlePresetClick = (saltName: string) => {
    setSearchQuery(saltName);
    loadDrugSubstitutes(saltName);
  };

  const handleCopyPrescription = (item: DrugSubstituteItem) => {
    const rxText = `Rx:
Generic Salt: ${data?.matchedSaltStandardName || item.saltComposition}
Recommended Substitute: ${item.brandName} (${item.genericOrBrandType})
Strength & Form: ${item.strength} ${item.dosageForm}
Pack Size: ${item.packSize}
Approx Price: ₹${item.priceINR.toFixed(2)} (₹${item.pricePerUnitINR.toFixed(2)} / unit)
NMC Compliance: Prescribed by Salt / Generic Composition per NMC Guidelines.`;

    navigator.clipboard.writeText(rxText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBookmark = (item: DrugSubstituteItem) => {
    addBookmark({
      type: 'drug-substitute',
      title: `${item.brandName} - ₹${item.priceINR} (${item.saltComposition})`,
      snippet: `${item.genericOrBrandType} by ${item.manufacturer}. ₹${item.pricePerUnitINR.toFixed(2)} per unit. ${item.availability}`,
      data: item,
      sources,
    });
    setBookmarkedId(item.id);
    setTimeout(() => setBookmarkedId(null), 2500);
  };

  // Sort and filter substitutes
  const sortedSubstitutes = data?.substitutes ? [...data.substitutes].sort((a, b) => {
    if (sortBy === 'cheapest') {
      return a.pricePerUnitINR - b.pricePerUnitINR;
    }
    if (sortBy === 'highest') {
      return b.pricePerUnitINR - a.pricePerUnitINR;
    }
    if (sortBy === 'janAushadhiOnly') {
      const aIsJan = a.genericOrBrandType === 'PMBJP Jan Aushadhi' ? -1 : 1;
      const bIsJan = b.genericOrBrandType === 'PMBJP Jan Aushadhi' ? -1 : 1;
      return aIsJan - bIsJan || a.pricePerUnitINR - b.pricePerUnitINR;
    }
    return 0;
  }) : [];

  const displayedSubstitutes = sortBy === 'janAushadhiOnly'
    ? sortedSubstitutes.filter(s => s.genericOrBrandType === 'PMBJP Jan Aushadhi' || s.genericOrBrandType === 'Government Generic')
    : sortedSubstitutes;

  const audioNarrationContent = data
    ? `${data.matchedSaltStandardName}. ${data.description}. Lowest generic price is ${data.priceRange.cheapestOptionName}. Highest brand is ${data.priceRange.highestOptionName}. Maximum savings is ${data.priceRange.maxSavingsPercent} percent. ${data.clinicalSafetyAlert}`
    : '';

  return (
    <div className="space-y-6">
      {/* Header section with required multicoloured Red styling */}
      <div className="bg-amber-100/90 border border-amber-400/50 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-700/10 border border-red-700/30 text-red-900 text-xs font-semibold mb-2">
              <Pill className="w-3.5 h-3.5 text-red-700" />
              <span>{isHindi ? 'दवा एवं साल्ट विकल्प विश्लेषक' : 'NMC & PMBJP Generic Drug Scout'}</span>
            </div>
            <h1 className="header-multicolor-red text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isHindi ? 'Drug and substitute: दवा व साल्ट विकल्प' : 'Drug and substitute: Generic & Brand Price Comparison'}
            </h1>
            <p className="text-stone-800 text-sm mt-1 max-w-3xl">
              {isHindi
                ? 'किसी भी दवा का साल्ट (सक्रिय घटक) दर्ज करें और सबसे सस्ते जेनेरिक (जन औषधि केंद्र) से लेकर उच्च ब्रांडेड विकल्पों तक मूल्य, बचत एवं एनएमसी दिशानिर्देशों सहित सटीक तुलना पाएं।'
                : 'Enter any pharmaceutical drug salt/molecule to find substitutes ordered strictly from generic cheapest (PMBJP Jan Aushadhi) to higher brands along with prices, per-tablet rates & NMC prescribing guidelines.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {data && (
              <AudioReaderButton
                text={audioNarrationContent}
                label={isHindi ? 'तुलना सुनें' : 'Listen Comparison'}
              />
            )}
            <button
              onClick={() => loadDrugSubstitutes(searchQuery)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{isHindi ? 'रिफ्रेश' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Salt Search Box */}
        <form onSubmit={handleSearchSubmit} className="mt-5">
          <div className="flex items-center gap-2 bg-white border-2 border-stone-800 p-1.5 shadow-sm">
            <Search className="w-5 h-5 text-stone-500 ml-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? 'दवा का साल्ट या ब्रांड नाम लिखें (उदा. Paracetamol 650mg, Amoxicillin 625mg, Metformin, Pantoprazole)...'
                  : 'Type any drug salt or brand (e.g. Paracetamol 650mg, Amoxicillin + Clavulanate 625mg, Metformin 500mg, Atorvastatin)...'
              }
              className="flex-1 px-2 py-1 text-sm sm:text-base text-stone-900 focus:outline-hidden bg-transparent"
            />
            <VoiceInputButton
              onTranscript={(transcript) => {
                setSearchQuery(transcript);
                loadDrugSubstitutes(transcript);
              }}
              placeholderText={isHindi ? 'बोलकर खोजें' : 'Speak Salt Name'}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>{isHindi ? 'खोजें' : 'Find Substitutes'}</span>
            </button>
          </div>
        </form>

        {/* Quick Salt Presets */}
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-stone-800 shrink-0">
            {isHindi ? 'त्वरित साल्ट:' : 'Quick Salts:'}
          </span>
          {COMMON_SALT_PRESETS.map((preset) => (
            <button
              key={preset.salt}
              onClick={() => handlePresetClick(preset.salt)}
              className={`text-xs px-2.5 py-1 border font-medium transition-colors ${
                searchQuery.toLowerCase().includes(preset.labelEn.toLowerCase().split(' ')[0])
                  ? 'bg-red-700 text-white border-red-900 shadow-xs'
                  : 'bg-white/80 hover:bg-white text-stone-900 border-stone-300'
              }`}
            >
              {isHindi ? preset.labelHi : preset.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-white/90 border border-stone-300">
          <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <h3 className="header-multicolor-red text-lg font-bold">
            {isHindi ? 'दवा विकल्पों एवं मूल्यों की गणना जारी...' : 'Searching generic & brand drug substitutes...'}
          </h3>
          <p className="text-xs text-stone-600 mt-1">
            {isHindi
              ? 'जन औषधि केंद्र, एनपीपीए सीलिंग मूल्य और शीर्ष ब्रांडों की जांच की जा रही है...'
              : 'Cross-referencing PMBJP Jan Aushadhi prices, NPPA ceiling limits and market brand rates...'}
          </p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-bold">{isHindi ? 'त्रुटि: ' : 'Notice: '}</span>
            {error}
          </div>
        </div>
      )}

      {/* Main Content when data is ready */}
      {data && !loading && (
        <div className="space-y-6">
          {/* Summary Banner & Price Divergence Highlight */}
          <div className="bg-white border-2 border-stone-800 p-5 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2 py-0.5 border border-red-200">
                  {data.therapeuticCategory}
                </span>
                <h2 className="header-multicolor-red text-xl sm:text-2xl font-black mt-1">
                  {data.matchedSaltStandardName}
                </h2>
                <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-2xl">
                  {data.description}
                </p>
              </div>

              {/* Price comparison scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                <div className="bg-emerald-50 border border-emerald-300 p-3 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                    {isHindi ? 'न्यूनतम (जन औषधि)' : 'Cheapest (Generic)'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-0.5 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                    <span>{data.priceRange.lowestPriceINR.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block">
                    {isHindi ? 'प्रति गोली/यूनिट' : 'per tablet/unit'}
                  </span>
                </div>

                <div className="bg-purple-50 border border-purple-300 p-3 text-center">
                  <span className="text-[11px] font-bold text-purple-800 uppercase block">
                    {isHindi ? 'शीर्ष ब्रांड' : 'Top Brand'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-purple-900 mt-0.5 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4" />
                    <span>{data.priceRange.highestPriceINR.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-purple-700 block">
                    {isHindi ? 'प्रति गोली/यूनिट' : 'per tablet/unit'}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1 bg-red-50 border border-red-300 p-3 text-center flex flex-col justify-center">
                  <span className="text-[11px] font-bold text-red-800 uppercase block">
                    {isHindi ? 'अधिकतम बचत' : 'Max Savings'}
                  </span>
                  <div className="text-xl sm:text-2xl font-black text-red-700 mt-0.5">
                    {data.priceRange.maxSavingsPercent}%
                  </div>
                  <span className="text-[10px] text-red-700 block font-semibold">
                    {isHindi ? 'जेनेरिक चुनने पर' : 'by choosing generic'}
                  </span>
                </div>
              </div>
            </div>

            {/* Jan Aushadhi & NMC Highlight Note */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-amber-50 border border-amber-300 p-3 flex items-start gap-2.5">
                <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950 block">
                    {isHindi ? 'प्रधानमंत्री जन औषधि केंद्र (PMBJP) बचत लाभ:' : 'PMBJP Jan Aushadhi Kendra Savings:'}
                  </span>
                  <p className="text-stone-800 mt-0.5">{data.janAushadhiAvailabilityNotice}</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-300 p-3 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-blue-950 block">
                    {isHindi ? 'एनएमसी (NMC) जेनेरिक पर्चा नियम:' : 'NMC Generic Prescribing Mandate:'}
                  </span>
                  <p className="text-stone-800 mt-0.5">{data.nmcPrescribingGuideline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Substitutes List Header & Sorter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-200/70 border border-amber-400 p-3">
            <div className="flex items-center gap-2">
              <h3 className="header-multicolor-red text-base sm:text-lg font-black">
                {isHindi ? 'उपलब्ध विकल्प (सस्ते से महंगे क्रम में):' : 'Available Substitutes (Cheapest to Higher):'}
              </h3>
              <span className="px-2 py-0.5 bg-stone-900 text-yellow-300 text-xs font-bold">
                {displayedSubstitutes.length} {isHindi ? 'विकल्प' : 'options'}
              </span>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" />
                {isHindi ? 'क्रम:' : 'Sort:'}
              </span>
              <button
                onClick={() => setSortBy('cheapest')}
                className={`text-xs px-2.5 py-1 font-bold border transition-colors ${
                  sortBy === 'cheapest'
                    ? 'bg-red-700 text-white border-red-900 shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                }`}
              >
                {isHindi ? 'सस्ता पहले (जेनेरिक)' : 'Cheapest First (Generic)'}
              </button>
              <button
                onClick={() => setSortBy('highest')}
                className={`text-xs px-2.5 py-1 font-bold border transition-colors ${
                  sortBy === 'highest'
                    ? 'bg-red-700 text-white border-red-900 shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                }`}
              >
                {isHindi ? 'उच्च से सस्ता' : 'Higher to Cheap'}
              </button>
              <button
                onClick={() => setSortBy('janAushadhiOnly')}
                className={`text-xs px-2.5 py-1 font-bold border transition-colors ${
                  sortBy === 'janAushadhiOnly'
                    ? 'bg-emerald-800 text-white border-emerald-950 shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-800 border-stone-300'
                }`}
              >
                {isHindi ? 'केवल जन औषधि / सरकारी' : 'PMBJP Generics Only'}
              </button>
            </div>
          </div>

          {/* Cards for each substitute */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSubstitutes.map((sub, index) => {
              const isJanAushadhi = sub.genericOrBrandType === 'PMBJP Jan Aushadhi' || sub.genericOrBrandType === 'Government Generic';
              const isCheapest = index === 0 && sortBy === 'cheapest';

              return (
                <div
                  key={sub.id}
                  className={`bg-white border-2 transition-all p-4 relative flex flex-col justify-between ${
                    isCheapest
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-md'
                      : isJanAushadhi
                      ? 'border-emerald-400 bg-emerald-50/20'
                      : 'border-stone-300 hover:border-stone-500 shadow-xs'
                  }`}
                >
                  {/* Top Badge strip */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="w-5 h-5 bg-stone-900 text-yellow-300 font-bold text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 border ${
                            isJanAushadhi
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : sub.genericOrBrandType === 'Trade Generic'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : sub.genericOrBrandType === 'Branded Generic'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}
                        >
                          {sub.genericOrBrandType}
                        </span>

                        {isCheapest && (
                          <span className="text-[10px] bg-red-700 text-white font-black px-1.5 py-0.5 uppercase tracking-wide">
                            {isHindi ? 'सबसे सस्ता विकल्प' : 'Best Value / Cheapest'}
                          </span>
                        )}
                      </div>

                      {sub.savingsPercentVsTop !== undefined && sub.savingsPercentVsTop > 0 && (
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                          {isHindi ? `-${sub.savingsPercentVsTop}% सस्ता` : `Save ${sub.savingsPercentVsTop}%`}
                        </span>
                      )}
                    </div>

                    {/* Brand Name & Manufacturer */}
                    <h4 className="text-lg font-black text-stone-950 flex items-center gap-1.5">
                      {sub.brandName}
                    </h4>

                    <div className="flex items-center gap-1 text-xs text-stone-600 mt-0.5">
                      <Building className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="font-semibold text-stone-800">{sub.manufacturer}</span>
                    </div>

                    {/* Salt & Pack Specs */}
                    <div className="mt-3 bg-stone-50 border border-stone-200 p-2.5 text-xs space-y-1">
                      <div className="flex justify-between text-stone-700">
                        <span className="text-stone-500">{isHindi ? 'साल्ट संयोजन:' : 'Salt:'}</span>
                        <span className="font-semibold text-right">{sub.saltComposition}</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span className="text-stone-500">{isHindi ? 'पैक साइज:' : 'Pack Size:'}</span>
                        <span className="font-medium">{sub.packSize} ({sub.dosageForm})</span>
                      </div>
                      <div className="flex justify-between text-stone-700">
                        <span className="text-stone-500">{isHindi ? 'उपलब्धता:' : 'Availability:'}</span>
                        <span className="font-medium text-stone-800 text-right">{sub.availability}</span>
                      </div>
                      {sub.janAushadhiCode && (
                        <div className="flex justify-between text-stone-700 pt-1 border-t border-stone-200">
                          <span className="text-stone-500">{isHindi ? 'जन औषधि कोड:' : 'PMBJP Code:'}</span>
                          <span className="font-mono font-bold text-emerald-800">{sub.janAushadhiCode}</span>
                        </div>
                      )}
                    </div>

                    {sub.notesOrPrecautions && (
                      <p className="text-[11px] text-stone-600 italic mt-2">
                        • {sub.notesOrPrecautions}
                      </p>
                    )}
                  </div>

                  {/* Pricing footer & Action buttons */}
                  <div className="mt-4 pt-3 border-t border-stone-200">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-[11px] text-stone-500 block">
                          {isHindi ? 'पैक एमआरपी (₹):' : 'Pack MRP (₹):'}
                        </span>
                        <div className="text-xl font-black text-stone-900 flex items-center">
                          <IndianRupee className="w-4 h-4 text-stone-700" />
                          <span>{sub.priceINR.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-stone-500 block">
                          {isHindi ? 'प्रति गोली/यूनिट मूल्य:' : 'Per Unit / Tab Rate:'}
                        </span>
                        <div className="text-xl font-black text-red-700 flex items-center justify-end">
                          <IndianRupee className="w-4 h-4" />
                          <span>{sub.pricePerUnitINR.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Button actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyPrescription(sub)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                        title={isHindi ? 'डॉक्टर पर्चा साल्ट कॉपी करें' : 'Copy generic prescription note'}
                      >
                        {copiedId === sub.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{isHindi ? 'कॉपी हो गया' : 'Rx Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{isHindi ? 'Rx पर्चा कॉपी' : 'Copy Rx Note'}</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleBookmark(sub)}
                        className="px-2.5 py-1.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-medium transition-colors"
                        title={isHindi ? 'वाल्ट में सुरक्षित करें' : 'Bookmark to Vault'}
                      >
                        {bookmarkedId === sub.id ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>

                      {isJanAushadhi && (
                        <a
                          href="https://janaushadhi.gov.in"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors flex items-center gap-1"
                          title={isHindi ? 'जन औषधि केंद्र खोजें' : 'Locate Jan Aushadhi Kendra'}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>{isHindi ? 'केंद्र' : 'Store'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinical Pharmacology, Indications & Safety Alert Section */}
          <div className="bg-white border-2 border-stone-800 p-5 shadow-sm space-y-4">
            <h3 className="header-multicolor-red text-lg sm:text-xl font-black border-b border-stone-200 pb-2">
              {isHindi ? 'चिकित्सीय विवरण व सुरक्षा निर्देश (Clinical Details & Safety)' : 'Clinical Pharmacology & Prescribing Guidelines'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-bold text-stone-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  {isHindi ? 'स्वीकृत चिकित्सीय उपयोग (Indications):' : 'Common Approved Indications:'}
                </h4>
                <ul className="list-disc pl-5 text-stone-700 text-xs space-y-1">
                  {data.commonIndications.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>

                <h4 className="font-bold text-stone-900 mt-4 mb-1">
                  {isHindi ? 'मानक वयस्क खुराक (Standard Adult Dosage):' : 'Standard Adult Dosage:'}
                </h4>
                <p className="text-xs text-stone-700 bg-stone-50 border border-stone-200 p-2.5">
                  {data.standardAdultDosage}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-700" />
                  {isHindi ? 'सुरक्षा चेतावनी व सावधानियां (Safety Alert):' : 'Clinical Safety & Precautions:'}
                </h4>
                <div className="bg-red-50 border border-red-300 p-3 text-xs text-red-950">
                  {data.clinicalSafetyAlert}
                </div>

                <div className="mt-3 bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950">
                  <span className="font-bold block mb-1">
                    {isHindi ? 'जन औषधि केंद्र खोजें (PMBJP Helpline):' : 'PMBJP Store Locator & Helpline:'}
                  </span>
                  <p>
                    Toll-Free Helpline: <span className="font-bold">1800-180-8080</span> | Portal: <a href="https://janaushadhi.gov.in" target="_blank" rel="noopener noreferrer" className="underline font-semibold">janaushadhi.gov.in</a>. All medicines tested by NABL labs.
                  </p>
                </div>
              </div>
            </div>

            {/* Official Disclaimer */}
            <div className="pt-3 border-t border-stone-200 flex items-start gap-2 text-xs text-stone-600">
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p>
                <span className="font-semibold">{isHindi ? 'वैधानिक अस्वीकरण: ' : 'Statutory Disclaimer: '}</span>
                {data.disclaimer}
              </p>
            </div>
          </div>

          {/* Verification & Grounding Sources */}
          {sources.length > 0 && (
            <div className="bg-amber-50/80 border border-amber-300/80 p-4">
              <span className="text-xs font-bold text-stone-900 block mb-2">
                {isHindi ? 'सत्यापित स्रोत एवं औषधि मूल्य डेटाबेस:' : 'Official Regulatory & Drug Pricing Sources:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {sources.map((src, i) => (
                  <a
                    key={i}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-white border border-stone-300 hover:border-red-700 text-stone-800 transition-colors shadow-2xs"
                  >
                    <span>{src.title}</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
