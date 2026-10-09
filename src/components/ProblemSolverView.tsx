import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { solveProblem } from '../services/api';
import { ProblemSolverData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import { FactBadge } from './FactBadge';
import {
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Send,
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Coins,
  Copy,
  Check,
} from 'lucide-react';

export const ProblemSolverView: React.FC = () => {
  const { language, addBookmark, isBookmarked, addHistory, addReminder } = useApp();
  const isHindi = language === 'hi';

  const [problemText, setProblemText] = useState('');
  const [domain, setDomain] = useState('household');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProblemSolverData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sampleProblems = [
    {
      titleEn: 'Hard water scaling in geysers & home piping',
      titleHi: 'गीजर और पाइपलाइन में खारे पानी की स्केलिंग',
      domain: 'household',
      textEn: 'Our home bathroom geyser and kitchen pipes are frequently choking due to high TDS hard water scaling in Jaipur. Repair plumber visits every 3 months. How to fix this permanently without spending excessive money?',
      textHi: 'जयपुर में खारे पानी (high TDS) के कारण हमारे घर के गीजर और पाइप बार-बार चोक हो रहे हैं। हर 3 महीने में प्लंबर बुलाना पड़ता है। बिना अत्यधिक खर्च किए इसका स्थायी समाधान क्या है?',
    },
    {
      titleEn: 'Choosing between Tanda vs IGMC for specialist care',
      titleHi: 'विशेषज्ञ उपचार हेतु टांडा बनाम आईजीएमसी शिमला',
      domain: 'health',
      textEn: 'A family member in Kangra needs elective orthopedic knee surgery. We are comparing Dr RPGMC Tanda vs IGMC Shimla in terms of distance, wait time, doctor availability, and family stay logistics.',
      textHi: 'कांगड़ा में परिवार के सदस्य को घुटने की सर्जरी करवानी है। हम दूरी, वेटिंग समय और तीमारदार के ठहरने के आधार पर डॉ आरपीजीएमसी टांडा और आईजीएमसी शिमला की तुलना कर रहे हैं।',
    },
    {
      titleEn: 'Solar rooftop subsidy vs monthly savings in Rajasthan',
      titleHi: 'राजस्थान में सोलर रूफटॉप सब्सिडी व मासिक बचत',
      domain: 'technical',
      textEn: 'Our family electricity bill in Rajasthan is ₹4,500/month. We want to evaluate PM Surya Ghar solar rooftop (3kW vs 5kW), subsidy timeline, net-metering feasibility, and payback period.',
      textHi: 'राजस्थान में हमारा बिजली बिल ₹4,500 प्रति माह आता है। हम पीएम सूर्य घर योजना के तहत 3kW या 5kW सोलर रूफटॉप, सब्सिडी प्रक्रिया और पेबैक अवधि का विश्लेषण करना चाहते हैं।',
    },
    {
      titleEn: 'Home eldercare routine & emergency readiness',
      titleHi: 'घर पर बुजुर्गों की देखभाल और आपातकालीन तैयारी',
      domain: 'personal',
      textEn: 'Both working adults in the family. Elderly parents living at home with diabetes and mild hypertension. Need an actionable daily schedule, emergency protocol, and remote monitoring setup.',
      textHi: 'परिवार में दोनों वयस्क कामकाजी हैं। घर पर बुजुर्ग माता-पिता हैं जिन्हें डायबिटीज और हल्का बीपी है। एक व्यावहारिक दैनिक देखभाल दिनचर्या और आपातकालीन तैयारी योजना चाहिए।',
    },
  ];

  const domains = [
    { id: 'household', labelEn: 'Household & Home', labelHi: 'घरेलू व आवास' },
    { id: 'personal', labelEn: 'Personal & Family', labelHi: 'व्यक्तिगत व परिवार' },
    { id: 'technical', labelEn: 'Technical & Repair', labelHi: 'तकनीकी व मरम्मत' },
    { id: 'business', labelEn: 'Business & Finance', labelHi: 'व्यवसाय व वित्त' },
    { id: 'professional', labelEn: 'Professional / Career', labelHi: 'करियर व कार्यस्थल' },
    { id: 'health', labelEn: 'Health & Care Logistics', labelHi: 'स्वास्थ्य व देखभाल' },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!problemText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await solveProblem(problemText, domain, language);
      if (response.success && response.data) {
        setResult(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'Problem Solver',
          query: problemText.slice(0, 50) + '...',
          preview: response.data.recommendedOption || 'Solution generated',
        });
      } else {
        setError(response.error || 'Failed to analyze the problem.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: any) => {
    setDomain(sample.domain);
    setProblemText(isHindi ? sample.textHi : sample.textEn);
  };

  const handleBookmarkSolution = () => {
    if (!result) return;
    addBookmark({
      type: 'problem-solution',
      title: result.problemStatement || problemText.slice(0, 50),
      snippet: result.recommendedOption.slice(0, 140) + '...',
      data: result,
      sources: sources,
    });
  };

  const handleCreateReminderForStep = (stepText: string) => {
    addReminder({
      title: stepText,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'High',
      completed: false,
      category: 'Home',
    });
    alert(isHindi ? 'रिमाइंडर जोड़ दिया गया!' : 'Reminder added to your dashboard!');
  };

  const handleCopyReport = () => {
    if (!result) return;
    const report = `PROBLEM: ${result.problemStatement}\n\nROOT CAUSES:\n${result.rootCauses?.map(c => `- ${c.factor}: ${c.explanation}`).join('\n')}\n\nRECOMMENDED SOLUTION:\n${result.recommendedOption}\n\nIMMEDIATE ACTIONS:\n${result.actionChecklist?.day1Immediate?.map(a => `[ ] ${a}`).join('\n')}`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4 text-stone-700" />
          <span>{isHindi ? 'एआई समस्या समाधान एवं रणनीतिक सलाहकार' : 'AI Strategic Problem Solver'}</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          {isHindi ? 'व्यक्तिगत, घरेलू व तकनीकी समस्या समाधान' : 'Personal, Household & Professional Problem Solver'}
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {isHindi
            ? 'बोलकर या लिखकर किसी भी समस्या का विवरण दें। मूल कारणों का विश्लेषण, समाधानों की तुलना, लागत/जोखिम अनुमान और व्यावहारिक कदम प्राप्त करें।'
            : 'Describe any dilemma via text or voice. Get root-cause analysis, missing-info check, comparative solutions with costs & risks, and actionable checklists.'}
        </p>
      </div>

      {/* Input Form */}
      <div className="p-5 bg-white border border-stone-200 shadow-2xs space-y-4">
        {/* Domain selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">
            {isHindi ? 'समस्या का क्षेत्र चुनें' : 'Select Domain'}
          </label>
          <div className="flex flex-wrap gap-1.5">
            {domains.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDomain(d.id)}
                className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                  domain === d.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-white'
                }`}
              >
                {isHindi ? d.labelHi : d.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea + Voice Button */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              {isHindi ? 'समस्या का विस्तार से वर्णन करें (या बोलें)' : 'Describe Your Dilemma or Problem (Text or Voice)'}
            </label>
            <VoiceInputButton
              onTranscript={transcript => {
                setProblemText(prev => (prev ? `${prev} ${transcript}` : transcript));
              }}
              placeholderText={isHindi ? 'अपनी आवाज़ में समस्या बोलें' : 'Speak your problem'}
            />
          </div>

          <textarea
            rows={4}
            value={problemText}
            onChange={e => setProblemText(e.target.value)}
            placeholder={
              isHindi
                ? 'उदाहरण: घर के गीजर में खारे पानी की समस्या, बच्चों की पढ़ाई या करियर दुविधा, ऑफिस विवाद, बजट या उपकरण खराबी...'
                : 'Example: Solar rooftop setup, plumbing scale issue, hospital choice, eldercare schedule, inventory or career dilemma...'
            }
            className="w-full p-3 text-xs text-stone-900 bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 focus:bg-white transition-colors"
          />
        </div>

        {/* Quick sample chips */}
        <div>
          <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
            {isHindi ? 'त्वरित उदाहरण परीक्षण:' : 'Quick Home & Family Scenarios:'}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleProblems.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(s)}
                className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200 transition-colors text-left"
              >
                {isHindi ? s.titleHi : s.titleEn}
              </button>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={loading || !problemText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors"
          >
            {loading ? (
              <>
                <Layers className="w-3.5 h-3.5 animate-spin" />
                <span>{isHindi ? 'गहन विश्लेषण किया जा रहा है...' : 'Analyzing Causes & Solutions...'}</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isHindi ? 'समस्या का विश्लेषण करें' : 'Analyze & Solve Problem'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-stone-200">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? 'समस्या का पुनर्निरूपण' : 'Reframed Problem Statement'}
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-0.5">
                {result.problemStatement}
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <AudioReaderButton text={`${result.problemStatement}. Recommendation: ${result.recommendedOption}`} />
              <button
                onClick={handleCopyReport}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
                title="Copy structured summary"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isHindi ? 'कॉपी हो गया' : 'Copied') : (isHindi ? 'कॉपी' : 'Copy')}</span>
              </button>
              <button
                onClick={handleBookmarkSolution}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isHindi ? 'सहेजें' : 'Bookmark'}</span>
              </button>
            </div>
          </div>

          {/* Decisive Recommendation Banner */}
          {result.recommendedOption && (
            <div className="p-5 bg-stone-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>{isHindi ? 'अनुशंसित सर्वोत्तम दृष्टिकोण' : 'Decisive Strategic Recommendation'}</span>
              </div>
              <p className="text-sm text-stone-100 leading-relaxed font-medium">
                {result.recommendedOption}
              </p>
            </div>
          )}

          {/* Root Causes Analysis */}
          {result.rootCauses && result.rootCauses.length > 0 && (
            <div className="p-5 bg-white border border-stone-200 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? '1. मूल कारण विश्लेषण (Root Cause Analysis)' : '1. Root Cause Breakdown'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {result.rootCauses.map((cause, idx) => (
                  <div key={idx} className="p-3.5 bg-stone-50 border border-stone-200/80 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-800">{cause.factor}</span>
                      <span className="font-mono text-[10px] bg-stone-200/70 px-1.5 py-0.5">{cause.category}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {cause.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Information & Clarifying Questions */}
          {(result.missingInformation?.length > 0 || result.clarifyingQuestions?.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.missingInformation?.length > 0 && (
                <div className="p-4 bg-amber-50/50 border border-amber-200/70 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isHindi ? 'अज्ञात या लापता जानकारी' : 'Missing Information to Verify'}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-amber-950">
                    {result.missingInformation.map((info, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{info}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.clarifyingQuestions?.length > 0 && (
                <div className="p-4 bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-stone-500" />
                    <span>{isHindi ? 'निर्णय से पूर्व स्पष्टीकरण प्रश्न' : 'Clarifying Questions to Answer'}</span>
                  </div>
                  <ul className="space-y-1 text-xs text-stone-700">
                    {result.clarifyingQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Solutions Comparative Matrix */}
          {result.solutions && result.solutions.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? '2. संभावित समाधानों की तुलना (Solutions Comparison)' : '2. Solution Options Comparison'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.solutions.map((sol, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="border-b border-stone-100 pb-2">
                        <h5 className="text-sm font-bold text-stone-900">
                          {sol.name}
                        </h5>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {sol.description}
                        </p>
                      </div>

                      {/* Advantages */}
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                          {isHindi ? 'लाभ (Pros):' : 'Advantages:'}
                        </span>
                        <ul className="space-y-1 text-xs text-stone-700">
                          {sol.advantages?.map((adv, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{adv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Disadvantages */}
                      <div>
                        <span className="text-[11px] font-semibold text-rose-800 block mb-1">
                          {isHindi ? 'हानियां व सीमाएं (Cons):' : 'Disadvantages:'}
                        </span>
                        <ul className="space-y-1 text-xs text-stone-700">
                          {sol.disadvantages?.map((dis, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                              <span>{dis}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-stone-100 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-stone-600">
                        <span className="font-medium flex items-center gap-1">
                          <Coins className="w-3 h-3 text-stone-400" />
                          {isHindi ? 'अनुमानित लागत:' : 'Cost Estimate:'}
                        </span>
                        <span className="font-semibold text-stone-900">{sol.estimatedCost}</span>
                      </div>

                      <div className="flex items-center justify-between text-stone-600">
                        <span>{isHindi ? 'जोखिम स्तर:' : 'Risk Level:'}</span>
                        <span className={`font-semibold ${
                          sol.riskLevel?.toLowerCase() === 'high' ? 'text-rose-700' :
                          sol.riskLevel?.toLowerCase() === 'moderate' ? 'text-amber-700' : 'text-emerald-700'
                        }`}>
                          {sol.riskLevel}
                        </span>
                      </div>

                      {sol.riskMitigation && (
                        <div className="p-2 bg-stone-50 border border-stone-200/60 text-[11px] text-stone-600">
                          <span className="font-semibold text-stone-700">
                            {isHindi ? 'बचाव: ' : 'Mitigation: '}
                          </span>
                          {sol.riskMitigation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Next Steps Action Checklist */}
          {result.actionChecklist && (
            <div className="p-5 bg-white border border-stone-200 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? '3. व्यावहारिक कार्य योजना एवं चेकलिस्ट' : '3. Practical Action Checklist'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Day 1 Immediate */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-600" />
                    <span>{isHindi ? 'पहला दिन (Day 1 Immediate)' : 'Day 1: Immediate Steps'}</span>
                  </div>
                  <ul className="space-y-2 text-stone-700">
                    {result.actionChecklist.day1Immediate?.map((step, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-1.5 group">
                        <div className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </div>
                        <button
                          onClick={() => handleCreateReminderForStep(step)}
                          className="text-[10px] text-stone-400 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Add as reminder"
                        >
                          +Remind
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Week 1 Follow-up */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-600" />
                    <span>{isHindi ? 'सप्ताह 1 (Week 1 Follow-up)' : 'Week 1: Implementation'}</span>
                  </div>
                  <ul className="space-y-2 text-stone-700">
                    {result.actionChecklist.week1FollowUp?.map((step, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-1.5 group">
                        <div className="flex items-start gap-1.5">
                          <ArrowRight className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                          <span>{step}</span>
                        </div>
                        <button
                          onClick={() => handleCreateReminderForStep(step)}
                          className="text-[10px] text-stone-400 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Add as reminder"
                        >
                          +Remind
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Long-term safeguard */}
                <div className="p-3.5 bg-stone-50 border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isHindi ? 'दीर्घकालिक रोकथाम (Safeguard)' : 'Long-Term Safeguard'}</span>
                  </div>
                  <ul className="space-y-2 text-stone-700">
                    {result.actionChecklist.longTermSafeguard?.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Facts vs Assumptions Matrix (Epistemic rigor) */}
          {result.factsVsAssumptions && (
            <div className="p-4 bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                  {isHindi ? 'सत्यता एवं धारणाओं का वर्गीकरण' : 'Fact vs Assumption Matrix'}
                </span>
                <span className="text-xs text-stone-500">
                  Uncertainty Level: <strong className="text-stone-800">{result.factsVsAssumptions.uncertaintyLevel}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <FactBadge type="fact" text={isHindi ? 'पुष्ट तथ्य (Verified Facts)' : 'Established Facts'} />
                  <ul className="space-y-1 text-stone-700 mt-1">
                    {result.factsVsAssumptions.verifiedFacts?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1">
                  <FactBadge type="assumption" text={isHindi ? 'अनुमान व धारणाएं (Assumptions to confirm)' : 'Assumptions Requiring Validation'} />
                  <ul className="space-y-1 text-stone-700 mt-1">
                    {result.factsVsAssumptions.assumptionsMade?.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-600">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <SourcesList sources={sources} />
        </div>
      )}
    </div>
  );
};
