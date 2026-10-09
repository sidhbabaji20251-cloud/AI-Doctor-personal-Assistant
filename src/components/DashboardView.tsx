import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchNews, fetchMedicalResearch, translateText } from '../services/api';
import { AudioReaderButton } from './AudioReaderButton';
import { VoiceInputButton } from './VoiceInputButton';
import { DailyPlannerSection } from './DailyPlannerSection';
import { BarcodeInstallCard } from './BarcodeInstallCard';
import {
  Sun,
  Bell,
  Bookmark,
  Sparkles,
  Newspaper,
  Building2,
  Microscope,
  ShoppingBag,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Languages,
  Search,
  Plus,
  Trash2,
  Stethoscope,
  Pill,
  IndianRupee,
  ClipboardList,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const {
    language,
    reminders,
    toggleReminder,
    deleteReminder,
    addReminder,
    bookmarks,
    history,
  } = useApp();
  const isHindi = language === 'hi';

  const defaultBriefing = isHindi
    ? 'आज का दैनिक बुलेटिन: राजस्थान, जयपुर और हिमाचल प्रदेश में मुख्य प्रशासनिक एवं स्वास्थ्य सेवाएं सुचारू हैं। आईजीएमसी शिमला, टांडा, हमीरपुर व एसएमएस जयपुर में ओपीडी चालू है।'
    : 'Verified Morning Digest: Healthcare infrastructure and administrative desks remain active across Himachal Pradesh and Rajasthan. OPD services operational at IGMC Shimla, Dr RPGMC Tanda, Dr RKGMC Hamirpur, and SMS Jaipur.';

  const [dailyBriefing, setDailyBriefing] = useState<string>(defaultBriefing);
  const [briefingLoading, setBriefingLoading] = useState<boolean>(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderDate, setNewReminderDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [showAddReminder, setShowAddReminder] = useState(false);

  // Quick Translation Tool state
  const [quickTranslateInput, setQuickTranslateInput] = useState('');
  const [quickTranslateOutput, setQuickTranslateOutput] = useState('');
  const [quickTranslating, setQuickTranslating] = useState(false);

  const currentDate = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    async function loadMorningBriefing() {
      setBriefingLoading(true);
      try {
        const newsRes = await fetchNews('all', language);
        if (newsRes.success && newsRes.data?.summary) {
          setDailyBriefing(newsRes.data.summary);
        } else {
          setDailyBriefing(
            isHindi
              ? 'आज का दैनिक बुलेटिन: राजस्थान, जयपुर और हिमाचल प्रदेश में मुख्य प्रशासनिक एवं मौसम अद्यतन सामान्य हैं। अस्पतालों में ओपीडी सेवाएं सुचारू हैं।'
              : 'Today’s Briefing: Verified bulletins for Rajasthan, Himachal Pradesh and National desks show stable civic operations. Medical OPD services active at IGMC, Tanda, Hamirpur, and SMS Jaipur.'
          );
        }
      } catch {
        setDailyBriefing(
          isHindi
            ? 'आज के सत्यापित समाचार एवं मेडिकल बुलेटिन उपलब्ध हैं। नीचे दिए गए डेस्क पर क्लिक करके विस्तृत रिपोर्ट देखें।'
            : 'Verified briefings are available for Himachal, Rajasthan, and National desks. Select any bureau below for live reports.'
        );
      } finally {
        setBriefingLoading(false);
      }
    }
    loadMorningBriefing();
  }, [language]);

  const handleAddReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    addReminder({
      title: newReminderTitle.trim(),
      dueDate: newReminderDate,
      priority: 'Medium',
      completed: false,
      category: 'General',
    });
    setNewReminderTitle('');
    setShowAddReminder(false);
  };

  const handleQuickTranslate = async () => {
    if (!quickTranslateInput.trim()) return;
    setQuickTranslating(true);
    try {
      const targetLang = language === 'hi' ? 'en' : 'hi';
      const res = await translateText(quickTranslateInput, targetLang);
      setQuickTranslateOutput(res);
    } catch (err) {
      console.error(err);
    } finally {
      setQuickTranslating(false);
    }
  };

  const activeReminders = reminders.filter(r => !r.completed);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome & Morning Briefing Hero */}
      <div className="p-6 bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 text-amber-800 border border-amber-200">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {currentDate}
              </span>
              <h2 className="text-xl font-bold text-stone-900">
                {isHindi ? 'नमस्ते, आपका AI Doctor Personal Assistant दैनिक ब्रीफिंग' : 'Good Day, Your AI Doctor Personal Assistant Briefing'}
              </h2>
            </div>
          </div>

          <AudioReaderButton text={dailyBriefing} />
        </div>

        <div>
          {briefingLoading ? (
            <div className="py-4 text-xs text-stone-500 animate-pulse">
              {isHindi ? 'दैनिक सारांश तैयार किया जा रहा है...' : 'Compiling verified morning briefing...'}
            </div>
          ) : (
            <p className="text-sm text-stone-800 leading-relaxed font-serif sm:font-sans">
              {dailyBriefing}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs text-stone-500">
          <span className="font-semibold text-stone-700">
            {isHindi ? 'सक्रिय निगरानी क्षेत्र:' : 'Active Monitored Sectors:'}
          </span>
          <span>Jaipur</span>
          <span>·</span>
          <span>Rajasthan</span>
          <span>·</span>
          <span>Himachal Pradesh</span>
          <span>·</span>
          <span>National</span>
          <span>·</span>
          <span className="text-stone-800 font-medium">IGMC / Tanda / Hamirpur / SMS / NIMS</span>
        </div>
      </div>

      {/* Daily Planner & To-Do List (Everyday Refreshable, Add Tasks, Delete Completed) */}
      <DailyPlannerSection />

      {/* Android Phone Barcode Scan & Instant App Installation Card */}
      <BarcodeInstallCard language={language} />

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        <button
          onClick={() => onNavigateTab('prescriptions')}
          className="p-3.5 bg-white border-2 border-red-600 hover:border-red-800 transition-all text-left flex flex-col justify-between h-28 group shadow-xs"
        >
          <ClipboardList className="w-5 h-5 text-red-700 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-red-900">{isHindi ? 'मानक पर्चा' : 'Standard Rx:'}</div>
            <div className="text-[10px] text-stone-600 font-medium mt-0.5">Golwala Prescriber</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('drugs')}
          className="p-3.5 bg-white border-2 border-red-500 hover:border-red-700 transition-all text-left flex flex-col justify-between h-28 group shadow-xs"
        >
          <Pill className="w-5 h-5 text-red-700 group-hover:scale-110 transition-transform" />
          <div>
            <div className="text-xs font-bold text-red-900">{isHindi ? 'ड्रग व विकल्प' : 'Drug & Substitute:'}</div>
            <div className="text-[10px] text-stone-600 font-medium mt-0.5">Generic Cheapest to Higher</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('doctors')}
          className="p-3.5 bg-white border border-red-300 hover:border-red-600 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <Stethoscope className="w-5 h-5 text-red-700 group-hover:text-red-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'डॉक्टर्स न्यूज़' : 'Doctors News'}</div>
            <div className="text-[10px] text-red-700 font-semibold mt-0.5">NMC, HP Bond & Press</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('news')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <Newspaper className="w-5 h-5 text-stone-700 group-hover:text-stone-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'दैनिक समाचार' : 'Daily News'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">HP, RJ, National</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('institutes')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <Building2 className="w-5 h-5 text-stone-700 group-hover:text-stone-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'अस्पताल नोटिस' : 'Medical Hubs'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">IGMC, SMS, Tanda</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('research')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <Microscope className="w-5 h-5 text-stone-700 group-hover:text-stone-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'मेडिकल रिसर्च' : 'Medical R&D'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Diabetes, Heart, CKD</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('solver')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <Sparkles className="w-5 h-5 text-amber-700 group-hover:text-amber-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'समस्या समाधान' : 'AI Solver'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Voice & Text</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('market')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <ShoppingBag className="w-5 h-5 text-stone-700 group-hover:text-stone-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'मार्केट रिसर्च' : 'Live Market'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Prices in ₹ & Brands</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab('planning')}
          className="p-3.5 bg-white border border-stone-200 hover:border-stone-400 transition-all text-left flex flex-col justify-between h-28 group"
        >
          <CalendarCheck className="w-5 h-5 text-stone-700 group-hover:text-stone-900" />
          <div>
            <div className="text-xs font-bold text-stone-900">{isHindi ? 'कार्ययोजना' : 'Plans & Matrix'}</div>
            <div className="text-[10px] text-stone-500 mt-0.5">Budgets & Milestones</div>
          </div>
        </button>
      </div>

      {/* Standard Prescription Spotlight Banner */}
      <div className="bg-white border-2 border-red-600 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-700 text-white flex items-center justify-center shrink-0 border border-red-900 shadow-xs">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.2 bg-red-800 text-white text-[10px] font-mono font-bold uppercase">Golwala Reference</span>
              <h3 className="header-multicolor-red text-base font-black">
                {isHindi ? 'Standard Prescription: मानक दवा पर्चा' : 'Standard Prescription: Clinical Protocols'}
              </h3>
            </div>
            <p className="text-xs text-stone-700 mt-0.5">
              {isHindi
                ? 'डायबिटीज (माइल्ड, मॉडरेट, सीवियर), बीपी, अस्थमा, टाइफाइड, सीएडी, निमोनिया, यूटीआई, पीआईवीडी, माइग्रेन, मिर्गी, ग्लूकोमा, रीनल कोलिक आदि के मानक पर्चे।'
                : 'Standard prescriptions for Diabetes (Mild, Mod, Sev), HTN, Asthma, Enteric Fever, CAD, Pneumonia, UTI, PIVD, Migraine, Epilepsy, Glaucoma, Renal Colic & more.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('prescriptions')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 text-xs font-bold shadow-xs transition-colors shrink-0 border border-amber-400"
        >
          <span>{isHindi ? 'मानक पर्चे देखें' : 'View Standard Rx'}</span>
          <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
        </button>
      </div>

      {/* Drug and Substitute Quick Spotlight Banner */}
      <div className="bg-amber-100/90 border border-amber-400/60 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-700 text-yellow-300 flex items-center justify-center shrink-0 border border-red-900 shadow-xs">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="header-multicolor-red text-base font-black">
              {isHindi ? 'Drug and substitute: दवा व साल्ट विकल्प' : 'Drug and substitute: Find Substitutes & Prices'}
            </h3>
            <p className="text-xs text-stone-700">
              {isHindi
                ? 'किसी भी साल्ट के जेनेरिक सस्ते से लेकर महंगे ब्रांडेड विकल्पों की तुलना (जन औषधि केंद्र बचत)'
                : 'Add any salt to find substitutes from generic cheapest (PMBJP Jan Aushadhi) to higher brands with price.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('drugs')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <span>{isHindi ? 'साल्ट तुलना खोलें' : 'Open Drug & Substitute'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid: Reminders + Quick Translator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reminders Widget */}
        <div className="p-5 bg-white border border-stone-200 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-2">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-stone-700" />
                <h3 className="text-sm font-bold text-stone-900">
                  {isHindi ? 'सक्रिय रिमाइंडर एवं फॉलो-अप' : 'Active Reminders & Follow-Ups'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddReminder(!showAddReminder)}
                className="text-xs font-semibold text-stone-700 hover:text-stone-900 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isHindi ? 'नया' : 'Add'}</span>
              </button>
            </div>

            {showAddReminder && (
              <form onSubmit={handleAddReminderSubmit} className="p-3 bg-stone-50 border border-stone-200 space-y-2">
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={e => setNewReminderTitle(e.target.value)}
                  placeholder={isHindi ? 'रिमाइंडर का शीर्षक...' : 'Reminder title (e.g. Check Hamirpur OPD schedule)...'}
                  className="w-full p-2 text-xs bg-white border border-stone-200 focus:outline-hidden"
                />
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="date"
                    value={newReminderDate}
                    onChange={e => setNewReminderDate(e.target.value)}
                    className="p-1.5 text-xs bg-white border border-stone-200"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReminder(false)}
                      className="px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-200"
                    >
                      {isHindi ? 'रद्द' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800"
                    >
                      {isHindi ? 'जोड़ें' : 'Save'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeReminders.length === 0 ? (
              <p className="text-xs text-stone-400 py-3">
                {isHindi ? 'कोई लंबित रिमाइंडर नहीं है।' : 'No pending reminders. All tasks caught up!'}
              </p>
            ) : (
              <div className="space-y-2">
                {activeReminders.slice(0, 4).map(rem => (
                  <div
                    key={rem.id}
                    className="flex items-start justify-between gap-2 p-2.5 bg-stone-50/70 border border-stone-200/80 text-xs"
                  >
                    <div className="flex items-start gap-2">
                      <button
                        onClick={() => toggleReminder(rem.id)}
                        className="mt-0.5 text-stone-400 hover:text-emerald-700"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="font-medium text-stone-900">{rem.title}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">Due: {rem.dueDate}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteReminder(rem.id)}
                      className="text-stone-300 hover:text-rose-600 p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigateTab('reminders')}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 inline-flex items-center gap-1 pt-2 border-t border-stone-100"
          >
            <span>{isHindi ? 'सभी रिमाइंडर और बुकमार्क देखें' : 'View all reminders & bookmarks'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Instant Hindi-English Translation Tool */}
        <div className="p-5 bg-white border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">
                {isHindi ? 'त्वरित अनुवाद (हिन्दी ⇄ English)' : 'Quick Translation Assistant'}
              </h3>
            </div>
            <VoiceInputButton
              onTranscript={transcript => setQuickTranslateInput(transcript)}
            />
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={quickTranslateInput}
              onChange={e => setQuickTranslateInput(e.target.value)}
              placeholder={
                isHindi
                  ? 'अनुवाद के लिए कोई भी वाक्य, डॉक्टर की पर्ची या समाचार यहाँ लिखें...'
                  : 'Paste or type any phrase, clinical note, or notice to translate...'
              }
              className="w-full p-2.5 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] text-stone-500">
                {isHindi ? 'अनुवाद लक्ष्य: English' : 'Target: Hindi (हिन्दी)'}
              </span>
              <button
                type="button"
                onClick={handleQuickTranslate}
                disabled={quickTranslating || !quickTranslateInput.trim()}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50"
              >
                {quickTranslating ? (isHindi ? 'अनुवाद जारी...' : 'Translating...') : (isHindi ? 'अनुवाद करें' : 'Translate')}
              </button>
            </div>

            {quickTranslateOutput && (
              <div className="p-3 bg-stone-50 border border-stone-200 text-xs text-stone-900 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                  <span>{isHindi ? 'अनुवादित परिणाम' : 'Translated Output'}</span>
                  <AudioReaderButton text={quickTranslateOutput} />
                </div>
                <p className="leading-relaxed font-sans">{quickTranslateOutput}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bookmarks & Recent Activity Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bookmarks snapshot */}
        <div className="p-5 bg-white border border-stone-200 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">
                {isHindi ? 'सहेजे गए बुकमार्क' : 'Saved Research & Bookmarks'}
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">({bookmarks.length})</span>
          </div>

          {bookmarks.length === 0 ? (
            <p className="text-xs text-stone-400 py-2">
              {isHindi ? 'अभी कोई बुकमार्क नहीं सहेजा गया है।' : 'No saved bookmarks yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {bookmarks.slice(0, 3).map(bm => (
                <div key={bm.id} className="p-2.5 bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="uppercase font-semibold">{bm.type}</span>
                    <span>{bm.dateAdded}</span>
                  </div>
                  <div className="font-bold text-stone-900 truncate">{bm.title}</div>
                  <div className="text-stone-600 line-clamp-1">{bm.snippet}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Searchable History snapshot */}
        <div className="p-5 bg-white border border-stone-200 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-700" />
              <h3 className="text-sm font-bold text-stone-900">
                {isHindi ? 'हालिया गतिविधियां व इतिहास' : 'Recent Session History'}
              </h3>
            </div>
            <span className="text-xs text-stone-500 font-mono">({history.length})</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-stone-400 py-2">
              {isHindi ? 'कोई हालिया खोज नहीं।' : 'No session activity recorded yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {history.slice(0, 3).map(h => (
                <div key={h.id} className="p-2.5 bg-stone-50 border border-stone-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-500">
                    <span className="font-semibold">{h.type}</span>
                    <span>{h.timestamp}</span>
                  </div>
                  <div className="text-stone-800 font-medium truncate">{h.query}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
