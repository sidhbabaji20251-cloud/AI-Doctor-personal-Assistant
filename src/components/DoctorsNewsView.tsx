import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchDoctorsNews } from '../services/api';
import { DoctorsNewsData, DoctorNotificationItem, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { AudioReaderButton } from './AudioReaderButton';
import { SourcesList } from './SourcesList';
import {
  FileText,
  Building,
  Newspaper,
  GraduationCap,
  Stethoscope,
  Search,
  Filter,
  Bookmark,
  Share2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Copy,
  Printer,
  X,
  BookOpen,
} from 'lucide-react';

export const DoctorsNewsView: React.FC = () => {
  const { language, addBookmark, isBookmarked, requestExternalAction } = useApp();
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState<'all' | 'nmc' | 'hp_govt' | 'clippings' | 'national_pg'>('all');
  const [audienceFilter, setAudienceFilter] = useState<'All' | 'MBBS Students' | 'PG Doctors / Residents' | 'All Doctors'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsData, setNewsData] = useState<DoctorsNewsData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [selectedClipping, setSelectedClipping] = useState<DoctorNotificationItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async (query = '') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchDoctorsNews(activeTab, language, query);
      if (res.success && res.data) {
        setNewsData(res.data);
        setSources(res.sources || []);
      } else {
        setError(res.error || 'Failed to load doctors news.');
      }
    } catch (err: any) {
      setError(err?.message || 'Network or server error loading doctors news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(searchQuery);
  }, [activeTab, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData(searchQuery);
  };

  const handleCopyRef = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenSource = (item: DoctorNotificationItem) => {
    if (!item.sourceLink) return;
    requestExternalAction({
      title: isHindi ? 'आधिकारिक स्रोत पोर्टल पर जाएं' : 'Open Official Source Portal',
      description: isHindi
        ? `आप ${item.sourceAuthority} के आधिकारिक वेब पोर्टल (${item.sourceLink}) पर जाने वाले हैं।`
        : `You are about to navigate to ${item.sourceAuthority} official portal (${item.sourceLink}).`,
      actionLabel: isHindi ? 'पोर्टल खोलें' : 'Open Link',
      target: item.sourceLink,
      onConfirm: () => {
        window.open(item.sourceLink, '_blank', 'noopener,noreferrer');
      },
    });
  };

  // Compile full text for TTS
  const speechText = newsData
    ? `${isHindi ? 'डॉक्टर्स न्यूज़ बुलेटिन' : 'Doctors News Bulletin'}. ${newsData.summaryOverview}. ${
        newsData.nmcNotifications.map(n => n.title).join('. ')
      }. ${newsData.hpGovtNotifications.map(n => n.title).join('. ')}`
    : '';

  // Filter items based on audience and search
  const filterList = (items: DoctorNotificationItem[]) => {
    return items.filter(item => {
      const matchAudience = audienceFilter === 'All' || item.targetAudience === audienceFilter || item.targetAudience === 'All Doctors';
      const matchQuery =
        !searchQuery.trim() ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sourceAuthority.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.officialRefNo && item.officialRefNo.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchAudience && matchQuery;
    });
  };

  const allFilteredItems = newsData
    ? [
        ...filterList(newsData.nmcNotifications),
        ...filterList(newsData.hpGovtNotifications),
        ...filterList(newsData.newspaperClippings),
        ...filterList(newsData.nationalDoctorHeadlines),
      ]
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner Card */}
      <div className="p-6 bg-white border border-amber-600/30 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold mb-1">
              <span className="flex items-center gap-1 font-mono text-stone-800 bg-amber-100 px-2 py-0.5 border border-amber-300">
                <Stethoscope className="w-3.5 h-3.5 text-red-700" />
                <span>NMC · HP DME · Medical Gazettes · Press</span>
              </span>
              <span>·</span>
              <span className="text-[11px] text-stone-600 font-medium">
                {newsData?.lastUpdated || 'Current'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold header-multicolor-red tracking-tight">
              {isHindi ? 'डॉक्टर्स न्यूज़ (Doctors News)' : 'Doctors News & Medical Directives'}
            </h2>

            <p className="text-xs text-stone-700 mt-1 max-w-3xl leading-relaxed">
              {isHindi
                ? 'नवीनतम एनएमसी (NMC) अधिसूचनाएं, एमबीबीएस छात्रों एवं डॉक्टरों से संबंधित हिमाचल प्रदेश सरकार (HP Govt) के आदेश, समाचार पत्रों की कतरनें (Newspaper Clippings), तथा डॉक्टरों व पीजी छात्रों से जुड़ी राष्ट्रीय सुर्खियां।'
                : 'Verified National Medical Commission (NMC) circulars, Himachal Pradesh Govt orders on MBBS bonds and resident stipends, newspaper clippings with column excerpts, and national resident doctor headlines.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            {speechText && <AudioReaderButton text={speechText} label={isHindi ? 'बुलेटिन सुनें' : 'Listen'} />}
            <button
              onClick={() => loadData(searchQuery)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition-colors"
            >
              <span>{loading ? (isHindi ? 'अपडेट जारी...' : 'Syncing...') : (isHindi ? 'रिफ्रेश' : 'Refresh')}</span>
            </button>
          </div>
        </div>

        {/* Executive Overview Summary */}
        {newsData?.summaryOverview && (
          <div className="p-3.5 bg-amber-50/60 border border-amber-300 text-xs text-stone-900 leading-relaxed font-serif sm:font-sans">
            <span className="font-bold text-red-900 mr-1.5">
              {isHindi ? 'संपादकीय सारांश:' : 'Executive Bulletin:'}
            </span>
            {newsData.summaryOverview}
          </div>
        )}

        {/* Search & Filters Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={
                  isHindi
                    ? 'परिपत्र, बॉन्ड, स्टाइपेंड, अखबार का नाम या कॉलेज खोजें...'
                    : 'Search NMC circular, HP bond, resident stipend, newspaper name...'
                }
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-stone-300 focus:outline-hidden focus:border-red-600"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <VoiceInputButton
              onTranscript={transcript => {
                setSearchQuery(transcript);
                loadData(transcript);
              }}
              placeholderText={isHindi ? 'बोलकर खोजें' : 'Voice Search'}
            />

            <button
              type="submit"
              className="px-3.5 py-2 text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shrink-0"
            >
              {isHindi ? 'खोजें' : 'Search'}
            </button>
          </form>

          {/* Target Audience Dropdown */}
          <div className="flex items-center gap-1.5 text-xs shrink-0">
            <span className="text-stone-700 font-semibold text-[11px]">
              {isHindi ? 'संबद्धता:' : 'Audience:'}
            </span>
            <select
              value={audienceFilter}
              onChange={e => setAudienceFilter(e.target.value as any)}
              className="p-1.5 bg-white border border-stone-300 text-xs font-medium text-stone-800"
            >
              <option value="All">{isHindi ? 'सभी (All)' : 'All Audiences'}</option>
              <option value="MBBS Students">{isHindi ? 'एमबीबीएस छात्र (MBBS)' : 'MBBS Students'}</option>
              <option value="PG Doctors / Residents">{isHindi ? 'पीजी / रेजिडेंट्स (PG Doctors)' : 'PG Doctors / Residents'}</option>
              <option value="All Doctors">{isHindi ? 'सभी चिकित्सक (All Doctors)' : 'All Doctors'}</option>
            </select>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-stone-200 overflow-x-auto scrollbar-none pt-2">
          {[
            { id: 'all', labelEn: 'All Updates', labelHi: 'समग्र बुलेटिन', icon: Layers },
            { id: 'nmc', labelEn: 'NMC Notifications', labelHi: 'NMC परिपत्र', icon: FileText },
            { id: 'hp_govt', labelEn: 'HP Govt (MBBS & Doctors)', labelHi: 'HP सरकार आदेश', icon: Building },
            { id: 'clippings', labelEn: 'Newspaper Clippings', labelHi: 'अखबार की कतरनें', icon: Scissors },
            { id: 'national_pg', labelEn: 'National PG & Doctor Headlines', labelHi: 'राष्ट्रीय सुर्खियां', icon: GraduationCap },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                  isActive
                    ? 'border-red-700 text-red-900 bg-amber-100/70'
                    : 'border-transparent text-stone-700 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-700' : 'text-stone-500'}`} />
                <span>{isHindi ? tab.labelHi : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center bg-white border border-amber-600/30 space-y-3">
          <div className="w-8 h-8 border-3 border-red-700 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-stone-700">
            {isHindi
              ? 'राष्ट्रीय आयुर्विज्ञान आयोग, हिमाचल प्रदेश स्वास्थ्य विभाग व प्रमुख समाचार पत्रों से सत्यापित सूचनाएं संकलित की जा रही हैं...'
              : 'Compiling latest NMC circulars, HP Govt gazettes, and verified newspaper clippings...'}
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadData(searchQuery)}
            className="px-2.5 py-1 font-semibold text-white bg-red-700 hover:bg-red-800 text-[11px]"
          >
            {isHindi ? 'पुनः प्रयास' : 'Retry'}
          </button>
        </div>
      )}

      {/* Main Content Sections */}
      {!loading && newsData && (
        <div className="space-y-6">
          {/* TAB 1: ALL OR SPECIFIC SECTIONS */}

          {/* Section: Latest NMC Notifications */}
          {(activeTab === 'all' || activeTab === 'nmc') && filterList(newsData.nmcNotifications).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-red-700/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-700 text-white font-black text-xs">NMC</div>
                  <h3 className="text-base md:text-lg font-extrabold header-multicolor-red">
                    {isHindi ? 'नवीनतम एनएमसी (NMC) अधिसूचनाएं एवं परिपत्र' : 'Latest NMC Notifications & Regulatory Circulars'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-stone-700 font-bold">
                  {filterList(newsData.nmcNotifications).length} {isHindi ? 'परिपत्र' : 'Notices'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterList(newsData.nmcNotifications).map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    isHindi={isHindi}
                    onCopyRef={handleCopyRef}
                    copiedId={copiedId}
                    onOpenSource={handleOpenSource}
                    addBookmark={addBookmark}
                    isBookmarked={isBookmarked}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: HP Govt Notifications related to MBBS Students & Doctors */}
          {(activeTab === 'all' || activeTab === 'hp_govt') && filterList(newsData.hpGovtNotifications).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-red-700/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-700 text-white font-black text-xs">HP</div>
                  <h3 className="text-base md:text-lg font-extrabold header-multicolor-red">
                    {isHindi
                      ? 'हिमाचल प्रदेश सरकार (HP Govt): एमबीबीएस छात्र व डॉक्टर अधिसूचनाएं'
                      : 'Himachal Pradesh Govt: MBBS Student & Doctor Notifications'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-stone-700 font-bold">
                  {filterList(newsData.hpGovtNotifications).length} {isHindi ? 'आदेश' : 'Orders'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterList(newsData.hpGovtNotifications).map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    isHindi={isHindi}
                    onCopyRef={handleCopyRef}
                    copiedId={copiedId}
                    onOpenSource={handleOpenSource}
                    addBookmark={addBookmark}
                    isBookmarked={isBookmarked}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Newspaper Clippings & Press Reports */}
          {(activeTab === 'all' || activeTab === 'clippings') && filterList(newsData.newspaperClippings).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-red-700/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-stone-900 text-yellow-300 font-black text-xs">
                    <Scissors className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-base md:text-lg font-extrabold header-multicolor-red">
                    {isHindi
                      ? 'समाचार पत्रों में प्रकाशित खबरें व कतरनें (Newspaper Clippings)'
                      : 'News Appearing in Newspapers Along With Column Clippings'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-stone-700 font-bold">
                  {filterList(newsData.newspaperClippings).length} {isHindi ? 'कतरनें' : 'Clippings'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterList(newsData.newspaperClippings).map(item => (
                  <NewspaperClippingCard
                    key={item.id}
                    item={item}
                    isHindi={isHindi}
                    onInspectClipping={setSelectedClipping}
                    addBookmark={addBookmark}
                    isBookmarked={isBookmarked}
                    onOpenSource={handleOpenSource}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: National Headlines Related to Doctors & PG Students */}
          {(activeTab === 'all' || activeTab === 'national_pg') && filterList(newsData.nationalDoctorHeadlines).length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-red-700/80 pb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-red-800 text-white font-black text-xs">PG</div>
                  <h3 className="text-base md:text-lg font-extrabold header-multicolor-red">
                    {isHindi
                      ? 'डॉक्टरों एवं पीजी छात्रों से जुड़ी राष्ट्रीय सुर्खियां (National Headlines)'
                      : 'National Headlines Related to Doctors & PG Students'}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-stone-700 font-bold">
                  {filterList(newsData.nationalDoctorHeadlines).length} {isHindi ? 'मुद्दे' : 'Headlines'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filterList(newsData.nationalDoctorHeadlines).map(item => (
                  <NotificationCard
                    key={item.id}
                    item={item}
                    isHindi={isHindi}
                    onCopyRef={handleCopyRef}
                    copiedId={copiedId}
                    onOpenSource={handleOpenSource}
                    addBookmark={addBookmark}
                    isBookmarked={isBookmarked}
                  />
                ))}
              </div>
            </div>
          )}

          {allFilteredItems.length === 0 && (
            <div className="p-10 text-center bg-white border border-stone-300 text-stone-600 space-y-2">
              <Search className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="font-bold text-sm">
                {isHindi ? 'कोई सूचना नहीं मिली।' : 'No notifications match your current filter or search criteria.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setAudienceFilter('All');
                  loadData('');
                }}
                className="text-xs text-red-700 underline font-semibold"
              >
                {isHindi ? 'सभी फ़िल्टर साफ़ करें' : 'Clear all filters & show all'}
              </button>
            </div>
          )}

          {/* Grounding & Reliable Citations */}
          {sources.length > 0 && <SourcesList sources={sources} />}

          {/* Legal / Statutory Disclaimer */}
          <div className="p-4 bg-amber-50/70 border border-amber-300 text-[11px] text-stone-700 space-y-1">
            <div className="font-bold text-red-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-red-700" />
              <span>{isHindi ? 'कानूनी एवं प्रशासनिक प्रकटीकरण' : 'Regulatory & Statutory Disclosure'}</span>
            </div>
            <p>
              {newsData.disclaimer ||
                'This portal aggregates public information from official regulatory portals (NMC, HP DME) and accredited print news bureaus. Doctors, interns, and postgraduate candidates are advised to verify exact gazette numbers and administrative orders directly with respective state medical councils and institutional directorates.'}
            </p>
          </div>
        </div>
      )}

      {/* POPUP MODAL: Interactive Newspaper Clipping View */}
      {selectedClipping && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-xs">
          <div className="bg-[#fbf7ed] border-4 border-stone-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 space-y-4">
            {/* Scissor border cut effect header */}
            <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-stone-800 rotate-90" />
                <span className="text-xs uppercase tracking-widest font-mono font-bold text-stone-700">
                  {isHindi ? 'समाचार पत्र कतरन संग्रह' : 'Verified Newspaper Press Clipping'}
                </span>
              </div>
              <button
                onClick={() => setSelectedClipping(null)}
                className="p-1 text-stone-600 hover:text-stone-900 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Newspaper Masthead */}
            <div className="text-center border-b border-stone-400 pb-2 space-y-1">
              <div className="font-serif font-black text-2xl md:text-3xl tracking-tight text-stone-900 uppercase">
                {selectedClipping.newspaperDetails?.newspaperName || selectedClipping.sourceAuthority}
              </div>
              <div className="flex items-center justify-center gap-3 text-[11px] font-mono text-stone-600">
                <span>{selectedClipping.newspaperDetails?.edition || 'Regional Edition'}</span>
                <span>•</span>
                <span>{selectedClipping.dateIssued}</span>
                {selectedClipping.newspaperDetails?.pageNo && (
                  <>
                    <span>•</span>
                    <span>{selectedClipping.newspaperDetails.pageNo}</span>
                  </>
                )}
              </div>
            </div>

            {/* Article Headline */}
            <div>
              <h3 className="font-serif font-black text-xl md:text-2xl text-stone-950 leading-tight">
                {selectedClipping.title}
              </h3>
              {selectedClipping.newspaperDetails?.headlineHindi && (
                <div className="text-sm font-serif font-bold text-red-950 mt-1">
                  {selectedClipping.newspaperDetails.headlineHindi}
                </div>
              )}
            </div>

            {/* Newspaper Column Lead Snippet */}
            {selectedClipping.newspaperDetails?.columnSnippet && (
              <div className="p-4 bg-white/80 border-l-4 border-stone-900 font-serif text-xs md:text-sm text-stone-900 leading-relaxed space-y-2 italic">
                <p>"{selectedClipping.newspaperDetails.columnSnippet}"</p>
              </div>
            )}

            {/* Bullet Highlights */}
            <div className="space-y-1.5 pt-2 border-t border-stone-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                {isHindi ? 'मुख्य प्रकाशित बिंदु:' : 'Key Report Highlights:'}
              </span>
              <ul className="space-y-1 text-xs text-stone-800 list-disc list-inside">
                {selectedClipping.keyPoints.map((pt, idx) => (
                  <li key={idx} className="leading-snug">{pt}</li>
                ))}
              </ul>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-stone-400">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addBookmark({
                      title: selectedClipping.title,
                      type: 'doctors-news',
                      snippet: selectedClipping.summary,
                      data: selectedClipping,
                      sources: selectedClipping.sourceLink ? [{ title: selectedClipping.sourceAuthority, url: selectedClipping.sourceLink }] : undefined,
                    });
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-white border border-stone-400 text-stone-800 hover:bg-stone-100"
                >
                  <Bookmark className="w-3.5 h-3.5 text-red-700" />
                  <span>{isHindi ? 'वाल्ट में सहेजें' : 'Save To Vault'}</span>
                </button>

                {selectedClipping.sourceLink && (
                  <button
                    type="button"
                    onClick={() => handleOpenSource(selectedClipping)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white hover:bg-stone-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isHindi ? 'मूल स्रोत खोलें' : 'Read Source'}</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isHindi ? 'प्रिंट कतरन' : 'Print Clipping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Notification Card for Official Circulars / HP Orders / National Directives
interface NotificationCardProps {
  item: DoctorNotificationItem;
  isHindi: boolean;
  onCopyRef: (text: string, id: string) => void;
  copiedId: string | null;
  onOpenSource: (item: DoctorNotificationItem) => void;
  addBookmark: (bm: any) => void;
  isBookmarked: (title: string) => boolean;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
  item,
  isHindi,
  onCopyRef,
  copiedId,
  onOpenSource,
  addBookmark,
  isBookmarked,
}) => {
  const bookmarked = isBookmarked(item.title);

  return (
    <div className="p-4 bg-white border border-stone-200 shadow-2xs hover:border-amber-500 transition-all flex flex-col justify-between space-y-3">
      <div className="space-y-2">
        {/* Badges strip */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 text-[10px]">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`px-1.5 py-0.5 font-bold uppercase ${
                item.category === 'NMC'
                  ? 'bg-red-100 text-red-900 border border-red-300'
                  : item.category === 'HP_GOVT'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-stone-100 text-stone-900 border border-stone-300'
              }`}
            >
              {item.sourceAuthority}
            </span>

            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-700 font-mono border border-stone-200">
              {item.targetAudience}
            </span>
          </div>

          <span className="text-stone-500 font-mono">{item.dateIssued}</span>
        </div>

        {/* Title */}
        <h4 className="text-sm font-extrabold text-stone-900 leading-snug">
          {item.title}
        </h4>

        {/* Ref number if present */}
        {item.officialRefNo && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-stone-600 bg-stone-50 p-1.5 border border-stone-200">
            <span className="font-semibold text-stone-800">Ref:</span>
            <span className="truncate flex-1">{item.officialRefNo}</span>
            <button
              type="button"
              onClick={() => onCopyRef(item.officialRefNo!, item.id)}
              className="text-stone-500 hover:text-red-700 shrink-0"
              title="Copy reference number"
            >
              {copiedId === item.id ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Summary text */}
        <p className="text-xs text-stone-700 leading-relaxed">
          {item.summary}
        </p>

        {/* Key Points list */}
        {item.keyPoints && item.keyPoints.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              {isHindi ? 'मुख्य प्रावधान / निर्देश:' : 'Key Directives:'}
            </span>
            <ul className="space-y-1 text-xs text-stone-800">
              {item.keyPoints.map((kp, idx) => (
                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                  <span className="text-red-700 font-bold">•</span>
                  <span>{kp}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action required note */}
        {item.actionRequiredOrImplication && (
          <div className="p-2 bg-stone-50 border-l-2 border-amber-600 text-[11px] text-stone-700 leading-snug">
            <span className="font-semibold text-stone-900 mr-1">
              {isHindi ? 'निर्देश/असर:' : 'Implication:'}
            </span>
            {item.actionRequiredOrImplication}
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
        <button
          type="button"
          onClick={() => {
            addBookmark({
              title: item.title,
              type: 'doctors-news',
              snippet: item.summary,
              data: item,
              sources: item.sourceLink ? [{ title: item.sourceAuthority, url: item.sourceLink }] : undefined,
            });
          }}
          className="inline-flex items-center gap-1 text-stone-600 hover:text-red-700 font-medium"
        >
          <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-red-700 text-red-700' : ''}`} />
          <span>{bookmarked ? (isHindi ? 'सहेजा गया' : 'Saved') : (isHindi ? 'सहेजें' : 'Save')}</span>
        </button>

        {item.sourceLink && (
          <button
            type="button"
            onClick={() => onOpenSource(item)}
            className="inline-flex items-center gap-1 font-semibold text-red-700 hover:text-red-900"
          >
            <span>{isHindi ? 'आधिकारिक स्रोत' : 'Official Portal'}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};

// Sub-component: Newspaper Clipping Card
interface NewspaperClippingCardProps {
  item: DoctorNotificationItem;
  isHindi: boolean;
  onInspectClipping: (item: DoctorNotificationItem) => void;
  addBookmark: (bm: any) => void;
  isBookmarked: (title: string) => boolean;
  onOpenSource: (item: DoctorNotificationItem) => void;
}

const NewspaperClippingCard: React.FC<NewspaperClippingCardProps> = ({
  item,
  isHindi,
  onInspectClipping,
  addBookmark,
  isBookmarked,
  onOpenSource,
}) => {
  const details = item.newspaperDetails;
  const bookmarked = isBookmarked(item.title);

  return (
    <div className="p-4 bg-[#fcfaf2] border-2 border-dashed border-stone-400 shadow-2xs hover:border-red-700 transition-all flex flex-col justify-between space-y-3 relative group">
      {/* Newspaper Masthead strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-stone-300 pb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="font-serif font-black text-sm tracking-tight text-stone-900 uppercase">
              {details?.newspaperName || item.sourceAuthority}
            </span>
            <span className="text-[10px] text-stone-600 font-mono">
              ({details?.edition || 'Press'})
            </span>
          </div>

          <span className="text-[10px] font-mono text-stone-600">{item.dateIssued}</span>
        </div>

        {/* Headline in newsprint style */}
        <h4
          onClick={() => onInspectClipping(item)}
          className="font-serif font-extrabold text-sm md:text-base text-stone-950 leading-snug cursor-pointer group-hover:text-red-900 transition-colors"
        >
          {item.title}
        </h4>

        {/* Newspaper clipping excerpt box */}
        {details?.columnSnippet && (
          <div
            onClick={() => onInspectClipping(item)}
            className="p-3 bg-white/70 border border-stone-300 font-serif text-[11px] text-stone-800 italic leading-relaxed line-clamp-3 cursor-pointer"
          >
            "{details.columnSnippet}"
          </div>
        )}

        {/* Highlights */}
        {item.keyPoints && item.keyPoints.length > 0 && (
          <div className="space-y-1 text-xs text-stone-700">
            {item.keyPoints.slice(0, 2).map((kp, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] leading-snug">
                <span className="text-stone-500 font-bold">•</span>
                <span>{kp}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-2 border-t border-stone-300 text-xs">
        <button
          type="button"
          onClick={() => onInspectClipping(item)}
          className="inline-flex items-center gap-1 text-xs font-bold text-red-800 hover:text-red-950"
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>{isHindi ? 'कतरन विस्तार देखें' : 'View Full Clipping'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              addBookmark({
                title: item.title,
                type: 'doctors-news',
                snippet: item.summary,
                data: item,
                sources: item.sourceLink ? [{ title: item.sourceAuthority, url: item.sourceLink }] : undefined,
              });
            }}
            className="p-1 text-stone-500 hover:text-red-700"
            title="Save to vault"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-red-700 text-red-700' : ''}`} />
          </button>

          {item.sourceLink && (
            <button
              type="button"
              onClick={() => onOpenSource(item)}
              className="p-1 text-stone-500 hover:text-red-700"
              title="Open source"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
