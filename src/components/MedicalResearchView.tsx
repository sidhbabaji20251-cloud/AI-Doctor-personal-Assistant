import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchMedicalResearch } from '../services/api';
import { MedicalResearchData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import { FactBadge } from './FactBadge';
import {
  Microscope,
  RefreshCw,
  Search,
  Bookmark,
  BookmarkCheck,
  AlertTriangle,
  FileText,
  Activity,
  Heart,
  Brain,
  ShieldAlert,
} from 'lucide-react';

export const MedicalResearchView: React.FC = () => {
  const { language, settings, addBookmark, isBookmarked, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [selectedTopic, setSelectedTopic] = useState<string>('diabetes');
  const [customSearch, setCustomSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [researchData, setResearchData] = useState<MedicalResearchData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const predefinedTopics = [
    { id: 'diabetes', labelEn: 'Diabetes Mellitus', labelHi: 'मधुमेह (डायबिटीज)', icon: Activity },
    { id: 'schizophrenia', labelEn: 'Schizophrenia', labelHi: 'सिज़ोफ्रेनिया (मानसिक स्वास्थ्य)', icon: Brain },
    { id: 'kidney', labelEn: 'Kidney Disease (CKD)', labelHi: 'गुर्दा रोग (किडनी)', icon: FileText },
    { id: 'heart', labelEn: 'Heart Disease (Cardio)', labelHi: 'हृदय रोग (कार्डियोलॉजी)', icon: Heart },
  ];

  const allTopics = [
    ...predefinedTopics,
    ...settings.customMedicalTopics.map(t => ({
      id: t.toLowerCase().replace(/\s+/g, '-'),
      labelEn: t,
      labelHi: t,
      icon: Microscope,
    })),
  ];

  const loadResearch = async (topicId = selectedTopic, query = customSearch) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMedicalResearch(topicId, language, query);
      if (response.success && response.data) {
        setResearchData(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'Medical Research Report',
          query: `${topicId.toUpperCase()} ${query ? `(${query})` : ''}`,
          preview: response.data.executiveSummary.slice(0, 90) + '...',
        });
      } else {
        setError(response.error || 'Failed to fetch medical research updates.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching research.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResearch(selectedTopic, customSearch);
  }, [selectedTopic, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadResearch(selectedTopic, customSearch);
  };

  const handleBookmark = () => {
    if (!researchData) return;
    addBookmark({
      type: 'medical-research',
      title: researchData.topicTitle,
      snippet: researchData.executiveSummary.slice(0, 140) + '...',
      data: researchData,
      sources: sources,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Microscope className="w-4 h-4 text-stone-700" />
            <span>{isHindi ? 'चिकित्सा अनुसंधान एवं साक्ष्य समीक्षा' : 'Peer-Reviewed Medical Research Desk'}</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isHindi ? 'नवीनतम मेडिकल रिसर्च एवं नैदानिक प्रगति' : 'Clinical Advances & Medical Research'}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isHindi
              ? 'डायबिटीज, सिज़ोफ्रेनिया, गुर्दा रोग, हृदय रोग एवं अन्य विषयों पर साक्ष्य-आधारित अध्ययन (PubMed, NEJM, Lancet, ICMR)।'
              : 'Reliable advances in Diabetes, Schizophrenia, Kidney & Heart diseases backed by PubMed, Lancet, NEJM & ICMR.'}
          </p>
        </div>

        <button
          onClick={() => loadResearch(selectedTopic, customSearch)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'नवीनतम साक्ष्य खोजें' : 'Refresh Research'}</span>
        </button>
      </div>

      {/* Topic Switchers */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {allTopics.map(topic => {
            const Icon = topic.icon;
            const isSelected = selectedTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-stone-900 text-white border-stone-900 shadow-2xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-stone-500'}`} />
                <span>{isHindi ? topic.labelHi : topic.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Custom topic or question search */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customSearch}
              onChange={e => setCustomSearch(e.target.value)}
              placeholder={
                isHindi
                  ? 'कोई विशिष्ट अध्ययन, दवा या चिकित्सा प्रश्न खोजें...'
                  : 'Search specific trial, molecule, drug class, or clinical query...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
            />
          </div>
          <VoiceInputButton
            onTranscript={transcript => {
              setCustomSearch(transcript);
              loadResearch(selectedTopic, transcript);
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            {isHindi ? 'शोध करें' : 'Explore'}
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-stone-200">
          <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700">
            {isHindi
              ? 'वैज्ञानिक पत्रिकाओं (PubMed, NEJM, Lancet, ICMR) से साक्ष्य एकत्रित किए जा रहे हैं...'
              : 'Synthesizing evidence-based peer-reviewed literature and guideline updates...'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isHindi ? 'सख्त साक्ष्य समीक्षा चल रही है...' : 'Filtering verified clinical findings...'}
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{isHindi ? 'अनुसंधान डेटा लोड करने में असमर्थ' : 'Unable to load research data'}</span>
          </div>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => loadResearch(selectedTopic, customSearch)}
            className="mt-3 px-3 py-1.5 text-xs font-semibold bg-rose-800 text-white hover:bg-rose-900"
          >
            {isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
          </button>
        </div>
      ) : researchData ? (
        <div className="space-y-6">
          {/* Executive Synthesis Card */}
          <div className="p-6 bg-white border border-stone-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  {isHindi ? 'नैदानिक अद्यतन' : 'Clinical Summary'}
                </span>
                <h3 className="text-xl font-bold text-stone-900">
                  {researchData.topicTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <AudioReaderButton text={`${researchData.topicTitle}. ${researchData.executiveSummary}`} />
                <button
                  onClick={handleBookmark}
                  className="p-1.5 text-xs border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Bookmark Report"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-stone-800 leading-relaxed font-serif sm:font-sans">
              {researchData.executiveSummary}
            </p>
          </div>

          {/* Key Advances List */}
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {isHindi ? 'प्रमुख वैज्ञानिक खोजें एवं क्लिनिकल ट्रायल्स' : 'Key Advances & Clinical Breakthroughs'}
            </h4>

            <div className="grid grid-cols-1 gap-4">
              {researchData.keyAdvances?.map((adv, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white border border-stone-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <h5 className="text-base font-bold text-stone-900">
                      {adv.breakthrough}
                    </h5>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 border border-stone-200">
                        {adv.levelOfEvidence}
                      </span>
                      {adv.keyStudyOrAgency && (
                        <span className="text-[11px] font-mono text-stone-500">
                          {adv.keyStudyOrAgency}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 bg-stone-50 border border-stone-200/70 space-y-1">
                      <div className="font-semibold text-stone-700">
                        {isHindi ? 'कार्यप्रणाली / खोज तंत्र' : 'Mechanism & Discovery'}
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {adv.mechanismOrInnovation}
                      </p>
                    </div>

                    <div className="p-3 bg-stone-50 border border-stone-200/70 space-y-1">
                      <div className="font-semibold text-stone-700">
                        {isHindi ? 'क्लिनिकल महत्व एवं प्रभाव' : 'Clinical Significance'}
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        {adv.clinicalSignificance}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lifestyle / Practical Insights + Limitations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {researchData.lifestyleAndPracticalInsights && researchData.lifestyleAndPracticalInsights.length > 0 && (
              <div className="p-5 bg-emerald-50/40 border border-emerald-200/70 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHindi ? 'जीवनशैली व व्यावहारिक अंतर्दृष्टि' : 'Evidence-Based Practical Insights'}</span>
                </div>
                <ul className="space-y-2 text-xs text-emerald-950">
                  {researchData.lifestyleAndPracticalInsights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {researchData.limitationsAndUncertainties && researchData.limitationsAndUncertainties.length > 0 && (
              <div className="p-5 bg-amber-50/40 border border-amber-200/70 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isHindi ? 'सीमाएं, उपलब्धता एवं अनिश्चितताएं' : 'Limitations & Caveats'}</span>
                </div>
                <ul className="space-y-2 text-xs text-amber-950">
                  {researchData.limitationsAndUncertainties.map((limit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                      <span>{limit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Strict Medical Disclaimer */}
          <div className="p-4 bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-stone-800">
                {isHindi ? 'महत्वपूर्ण अस्वीकरण (Medical Disclaimer): ' : 'Important Educational Disclaimer: '}
              </span>
              <span>
                {researchData.medicalDisclaimer ||
                  (isHindi
                    ? 'यह शोध समीक्षा केवल सामान्य जागरूकता और शैक्षिक उद्देश्यों के लिए है। किसी भी दवा या उपचार में बदलाव करने से पहले हमेशा योग्य चिकित्सक से परामर्श लें।'
                    : 'This summary is strictly for educational awareness and does not constitute individual medical advice. Consult a licensed physician.')}
              </span>
            </div>
          </div>

          <SourcesList sources={sources} />
        </div>
      ) : null}
    </div>
  );
};
