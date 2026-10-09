import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchMedicalInstitutes, translateText } from '../services/api';
import { MedicalInstitutionsData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import { FactBadge } from './FactBadge';
import {
  Building2,
  RefreshCw,
  Phone,
  Calendar,
  AlertCircle,
  Bookmark,
  BookmarkCheck,
  Languages,
  CheckCircle2,
  Search,
  ExternalLink,
} from 'lucide-react';

export const MedicalInstitutionsView: React.FC = () => {
  const { language, addBookmark, isBookmarked, addHistory, requestExternalAction } = useApp();
  const isHindi = language === 'hi';

  const [selectedInstitute, setSelectedInstitute] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [institutesData, setInstitutesData] = useState<MedicalInstitutionsData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const institutes = [
    { id: 'all', nameEn: 'All 5 Institutions', nameHi: 'सभी 5 मेडिकल संस्थान', location: 'HP & Rajasthan' },
    { id: 'igmc', nameEn: 'IGMC Shimla', nameHi: 'आईजीएमसी शिमला (IGMC)', location: 'Shimla, Himachal Pradesh' },
    { id: 'tanda', nameEn: 'Dr RPGMC Tanda', nameHi: 'डॉ आरपीजीएमसी टांडा', location: 'Kangra, Himachal Pradesh' },
    { id: 'hamirpur', nameEn: 'Dr RKGMC Hamirpur', nameHi: 'डॉ आरकेजीएमसी हमीरपुर', location: 'Hamirpur, Himachal Pradesh' },
    { id: 'sms', nameEn: 'SMS Medical College Jaipur', nameHi: 'एसएमएस मेडिकल कॉलेज जयपुर', location: 'Jaipur, Rajasthan' },
    { id: 'nims', nameEn: 'NIMS Jaipur', nameHi: 'निम्स (NIMS) जयपुर', location: 'Jaipur, Rajasthan' },
  ];

  const loadUpdates = async (instId = selectedInstitute, query = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchMedicalInstitutes(instId, language, query);
      if (response.success && response.data) {
        setInstitutesData(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'Medical Hospital Tracker',
          query: `${instId.toUpperCase()} ${query ? `(${query})` : ''}`,
          preview: response.data.institutions?.[0]?.name || 'Hospital updates',
        });
      } else {
        setError(response.error || 'Failed to fetch medical institution data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching institution updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpdates(selectedInstitute, searchQuery);
  }, [selectedInstitute, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUpdates(selectedInstitute, searchQuery);
  };

  const handleHelplineClick = (instituteName: string, contactInfo: string) => {
    requestExternalAction({
      title: isHindi ? 'हेल्पलाइन संपर्क सत्यापन' : 'Medical Helpline Call Approval',
      description: isHindi
        ? `आप ${instituteName} के संपर्क विवरण या फोन नंबर का उपयोग करना चाहते हैं: "${contactInfo}". पुष्टि करें?`
        : `You are requesting access or calling the direct helpline for ${instituteName}: "${contactInfo}". Please confirm approval.`,
      actionLabel: isHindi ? 'संपर्क करें' : 'Proceed',
      target: contactInfo,
      onConfirm: () => {
        if (/[\d+]{7,}/.test(contactInfo)) {
          window.location.href = `tel:${contactInfo.replace(/[^\d+]/g, '')}`;
        } else {
          alert(`Official Contact: ${contactInfo}`);
        }
      },
    });
  };

  const handleToggleBookmark = (inst: any) => {
    addBookmark({
      type: 'medical-update',
      title: inst.name,
      snippet: inst.statusNotice || inst.recentUpdates?.[0]?.headline || 'Hospital Notice',
      data: inst,
      sources: sources,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4 text-stone-700" />
            <span>{isHindi ? 'मेडिकल कॉलेज एवं अस्पताल ट्रैकर' : 'Premier Medical Institutions Tracker'}</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isHindi ? 'अस्पताल एवं संस्थान अद्यतन' : 'Medical Institution Bulletins'}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isHindi
              ? 'आईजीएमसी शिमला, टांडा, हमीरपुर, एसएमएस जयपुर एवं निम्स जयपुर की ओपीडी, सूचनाएं और दिशानिर्देश।'
              : 'Tracking IGMC Shimla, Dr RPGMC Tanda, Dr RKGMC Hamirpur, SMS Jaipur, and NIMS Jaipur.'}
          </p>
        </div>

        <button
          onClick={() => loadUpdates(selectedInstitute, searchQuery)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'ताज़ा सूचनाएं देखें' : 'Refresh Notices'}</span>
        </button>
      </div>

      {/* College Switcher Tabs */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {institutes.map(inst => (
            <button
              key={inst.id}
              onClick={() => setSelectedInstitute(inst.id)}
              className={`p-2.5 text-left border transition-all ${
                selectedInstitute === inst.id
                  ? 'bg-white border-stone-900 shadow-xs'
                  : 'bg-stone-50 border-stone-200 hover:bg-white text-stone-700'
              }`}
            >
              <div className="text-xs font-semibold text-stone-900 truncate">
                {isHindi ? inst.nameHi : inst.nameEn}
              </div>
              <div className="text-[10px] text-stone-500 truncate mt-0.5">
                {inst.location}
              </div>
            </button>
          ))}
        </div>

        {/* Search within notices */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? 'ओपीडी समय, डॉक्टर सूची, दाखिला, या जांच सुविधा खोजें...'
                  : 'Search OPD timings, admissions, testing facilities, or advisories...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
            />
          </div>
          <VoiceInputButton
            onTranscript={transcript => {
              setSearchQuery(transcript);
              loadUpdates(selectedInstitute, transcript);
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            {isHindi ? 'खोजें' : 'Filter'}
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-stone-200">
          <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700">
            {isHindi
              ? 'अस्पताल पोर्टलों और लाइव सूचनाओं से डेटा संकलित किया जा रहा है...'
              : 'Verifying official notifications, OPD bulletins, and health notices...'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            IGMC Shimla · Dr RPGMC Tanda · Dr RKGMC Hamirpur · SMS Jaipur · NIMS Jaipur
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <AlertCircle className="w-4 h-4" />
            <span>{isHindi ? 'अस्पताल सूचनाएं प्राप्त करने में त्रुटि' : 'Unable to load institution bulletins'}</span>
          </div>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => loadUpdates(selectedInstitute, searchQuery)}
            className="mt-3 px-3 py-1.5 text-xs font-semibold bg-rose-800 text-white hover:bg-rose-900"
          >
            {isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
          </button>
        </div>
      ) : institutesData ? (
        <div className="space-y-6">
          <div className="space-y-5">
            {institutesData.institutions?.map((inst, idx) => {
              const bookmarked = isBookmarked(inst.name);

              return (
                <div
                  key={idx}
                  className="p-6 bg-white border border-stone-200 shadow-2xs space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-stone-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                        <span className="font-semibold text-stone-800">{inst.shortCode || inst.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{inst.location}</span>
                      </div>
                      <h3 className="text-lg font-bold text-stone-900">
                        {inst.name}
                      </h3>
                      {inst.statusNotice && (
                        <p className="text-xs text-amber-900 bg-amber-50 px-2.5 py-1 border border-amber-200/60 mt-1.5 inline-block">
                          {inst.statusNotice}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <AudioReaderButton
                        text={`${inst.name}. Status: ${inst.statusNotice || ''}. Updates: ${inst.recentUpdates?.map(u => u.headline + ' - ' + u.details).join('. ')}`}
                      />
                      <button
                        onClick={() => handleToggleBookmark(inst)}
                        className={`p-1.5 text-xs border border-stone-200 transition-colors ${
                          bookmarked ? 'text-amber-800 bg-amber-50 border-amber-300' : 'text-stone-500 hover:text-stone-900'
                        }`}
                        title={bookmarked ? 'Saved' : 'Bookmark'}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Updates list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                      {isHindi ? 'हालिया सूचनाएं एवं सेवाएं' : 'Recent Notices & Clinical Services'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {inst.recentUpdates?.map((up, uIdx) => (
                        <div key={uIdx} className="p-3.5 bg-stone-50 border border-stone-200/80 space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500">
                            <span className="font-medium text-stone-700 uppercase">{up.type}</span>
                            {up.date && <span>{up.date}</span>}
                          </div>
                          <div className="text-xs font-bold text-stone-900 leading-snug">
                            {up.headline}
                          </div>
                          <div className="text-xs text-stone-600 leading-relaxed">
                            {up.details}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patient guidance & Helpline row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
                    {inst.actionGuidanceForPatients && (
                      <div className="text-xs text-stone-700 bg-emerald-50/60 p-3 border border-emerald-100 space-y-1">
                        <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{isHindi ? 'मरीजों और तीमारदारों के लिए मार्गदर्शन' : 'Patient & Visitor Guidance'}</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">
                          {inst.actionGuidanceForPatients}
                        </p>
                      </div>
                    )}

                    {inst.helplineOrContact && (
                      <div className="text-xs bg-stone-50 p-3 border border-stone-200 flex flex-col justify-between gap-2">
                        <div>
                          <div className="font-semibold text-stone-800 flex items-center gap-1.5 mb-1">
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                            <span>{isHindi ? 'आधिकारिक हेल्पलाइन / संपर्क' : 'Hospital Helpdesk / Portal'}</span>
                          </div>
                          <p className="text-stone-600 font-mono text-[11px] break-all">
                            {inst.helplineOrContact}
                          </p>
                        </div>
                        <button
                          onClick={() => handleHelplineClick(inst.name, inst.helplineOrContact || '')}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-800 bg-white border border-stone-300 hover:bg-stone-100 transition-colors self-start"
                        >
                          <Phone className="w-3 h-3 text-stone-600" />
                          <span>{isHindi ? 'सत्यापित संपर्क खोलें' : 'Access Contact Info'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {institutesData.disclaimer && (
            <div className="p-3 bg-stone-50 border border-stone-200 text-xs text-stone-500 italic">
              {institutesData.disclaimer}
            </div>
          )}

          <SourcesList sources={sources} />
        </div>
      ) : null}
    </div>
  );
};
