import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generatePlan } from '../services/api';
import { PlanData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import { FactBadge } from './FactBadge';
import {
  CalendarCheck,
  CheckSquare,
  DollarSign,
  Table,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
  Send,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const PlanningView: React.FC = () => {
  const { language, addBookmark, addReminder, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('30 days');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sampleGoals = [
    {
      titleEn: 'Install 3kW Solar Rooftop (Jaipur)',
      titleHi: '3kW सोलर रूफटॉप स्थापना (जयपुर)',
      goalEn: 'Install 3kW rooftop solar system at home in Jaipur with PM Surya Ghar subsidy approval and net metering within 60 days',
      goalHi: 'जयपुर में घर पर 60 दिनों में पीएम सूर्य घर सब्सिडी और नेट मीटरिंग के साथ 3kW रूफटॉप सोलर सिस्टम स्थापित करना',
      timeframe: '60 days',
      budget: '₹1.8 - ₹2.0 Lakh',
    },
    {
      titleEn: 'Post-Surgery Home Care Plan (Tanda/IGMC)',
      titleHi: 'सर्जरी के बाद घरेलू देखभाल योजना',
      goalEn: 'Prepare 30-day structured home nursing, physiotherapy, and medication routine for knee surgery patient after discharge from Dr RPGMC Tanda',
      goalHi: 'डॉ आरपीजीएमसी टांडा से डिस्चार्ज के बाद घुटने की सर्जरी के मरीज के लिए 30 दिवसीय घरेलू नर्सिंग, फिजियोथेरेपी और दवा योजना तैयार करना',
      timeframe: '30 days',
      budget: '₹15,000 - ₹30,000',
    },
    {
      titleEn: 'Monsoon Home Protection Checklist (Himachal)',
      titleHi: 'मानसून गृह सुरक्षा व जल निकासी चेकलिस्ट (हिमाचल)',
      goalEn: 'Prevent water seepage, drain blockages, and roof dampness in Himachal home before heavy rainy season',
      goalHi: 'भारी बारिश से पहले हिमाचल के मकान में सीलन, ड्रेनेज रुकावट और छत लीकेज की रोकथाम योजना',
      timeframe: '14 days',
      budget: '₹20,000',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await generatePlan(goal, timeframe, budget, language);
      if (response.success && response.data) {
        setPlan(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'Strategic Plan',
          query: goal.slice(0, 50),
          preview: response.data.planTitle || 'Action plan generated',
        });
      } else {
        setError(response.error || 'Failed to generate plan.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: any) => {
    setGoal(isHindi ? sample.goalHi : sample.goalEn);
    setTimeframe(sample.timeframe);
    setBudget(sample.budget);
  };

  const handleAddTaskAsReminder = (taskText: string) => {
    addReminder({
      title: taskText,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      priority: 'Medium',
      completed: false,
      category: 'Home',
    });
    alert(isHindi ? 'कार्य को रिमाइंडर में जोड़ दिया गया!' : 'Task added to reminders!');
  };

  const handleBookmark = () => {
    if (!plan) return;
    addBookmark({
      type: 'plan',
      title: plan.planTitle,
      snippet: plan.objective.slice(0, 140) + '...',
      data: plan,
      sources: sources,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <CalendarCheck className="w-4 h-4 text-stone-700" />
          <span>{isHindi ? 'शोध, योजना एवं निर्णय मैट्रिक्स' : 'Research, Action Planning & Decision Matrices'}</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          {isHindi ? 'कार्ययोजना, बजट व निर्णय मैट्रिक्स' : 'Actionable Plans, Budgets & Decision Matrices'}
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {isHindi
            ? 'कार्यान्वयन योग्य चरण, चेकलिस्ट, बजट अनुमान, पुष्ट तथ्यों व मान्यताओं का स्पष्ट वर्गीकरण और स्कोरिंग मैट्रिक्स।'
            : 'Phased implementation roadmaps, task checklists, itemized budgets, verified facts vs assumptions, and weighted decision matrices.'}
        </p>
      </div>

      {/* Input Card */}
      <div className="p-5 bg-white border border-stone-200 shadow-2xs space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                {isHindi ? 'आपका लक्ष्य या परियोजना' : 'Your Goal or Project Objective'}
              </label>
              <VoiceInputButton
                onTranscript={transcript => {
                  setGoal(prev => (prev ? `${prev} ${transcript}` : transcript));
                }}
                placeholderText={isHindi ? 'बोलकर लक्ष्य बताएं' : 'Speak goal'}
              />
            </div>
            <textarea
              rows={3}
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder={
                isHindi
                  ? 'उदा. 3kW सोलर रूफटॉप लगवाना, अस्पताल डिस्चार्ज के बाद 30 दिन की देखभाल, घर का बजट प्रबंधन, बच्चों की प्रवेश परीक्षा तैयारी...'
                  : 'e.g. Set up 3kW rooftop solar in Jaipur, organize post-surgery home recovery schedule, household emergency fund plan...'
              }
              className="w-full p-3 text-xs text-stone-900 bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 focus:bg-white transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                {isHindi ? 'लक्षित समय-सीमा (Timeframe)' : 'Target Timeframe'}
              </label>
              <select
                value={timeframe}
                onChange={e => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
              >
                <option value="7 days">7 Days (Immediate Sprint)</option>
                <option value="14 days">14 Days (Two Weeks)</option>
                <option value="30 days">30 Days (1 Month)</option>
                <option value="60 days">60 Days (2 Months)</option>
                <option value="90 days">90 Days (Quarterly Plan)</option>
                <option value="6 months">6 Months (Long Range)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                {isHindi ? 'बजट सीमा (वैकल्पिक)' : 'Budget Target (Optional)'}
              </label>
              <input
                type="text"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder={isHindi ? 'उदा. ₹25,000 या कम से कम लागत' : 'e.g. ₹50,000 or Minimal Budget'}
                className="w-full px-3 py-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick preset goals */}
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
              {isHindi ? 'त्वरित योजना टेम्पलेट:' : 'Quick Plan Templates:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleGoals.map((s, idx) => (
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

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? 'योजना तैयार की जा रही है...' : 'Building Strategic Plan...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'विस्तृत कार्ययोजना बनाएं' : 'Generate Action Plan'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Plan Output */}
      {plan && (
        <div className="space-y-6">
          {/* Plan Header */}
          <div className="p-5 bg-white border border-stone-200 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  {isHindi ? 'योजना शीर्षक' : 'Action Plan'}
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                  {plan.planTitle}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <AudioReaderButton text={`${plan.planTitle}. Objective: ${plan.objective}. Immediate next step: ${plan.immediateNextStep}`} />
                <button
                  onClick={handleBookmark}
                  className="p-1.5 text-xs border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-stone-700 leading-relaxed">
              <strong className="text-stone-900">{isHindi ? 'उद्देश्य: ' : 'Objective: '}</strong>
              {plan.objective}
            </p>

            {plan.immediateNextStep && (
              <div className="mt-3 p-3 bg-stone-900 text-white flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    <strong>{isHindi ? 'आज का पहला कदम (1 घंटे में): ' : 'Immediate Action (Within 1 Hour): '}</strong>
                    {plan.immediateNextStep}
                  </span>
                </div>
                <button
                  onClick={() => handleAddTaskAsReminder(plan.immediateNextStep)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-stone-800 hover:bg-stone-700 text-amber-200 shrink-0 transition-colors"
                >
                  {isHindi ? '+रिमाइंडर' : '+Add Reminder'}
                </button>
              </div>
            )}
          </div>

          {/* Phased Checklists */}
          {plan.phases && plan.phases.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? 'चरणबद्ध कार्यान्वयन एवं चेकलिस्ट' : 'Phased Implementation Checklists'}
              </h4>

              <div className="grid grid-cols-1 gap-4">
                {plan.phases.map((phase, pIdx) => (
                  <div key={pIdx} className="p-5 bg-white border border-stone-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-stone-400">0{pIdx + 1}.</span>
                        <h5 className="text-sm font-bold text-stone-900">{phase.phaseName}</h5>
                      </div>
                      <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-0.5 border border-stone-200">
                        {phase.duration}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {phase.checklist?.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          className="flex items-center justify-between gap-2 p-2 bg-stone-50/70 border border-stone-150 text-xs text-stone-800"
                        >
                          <div className="flex items-start gap-2">
                            <CheckSquare className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />
                            <span>{item.task}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-stone-500 bg-white px-1.5 py-0.5 border border-stone-200">
                              {item.owner}
                            </span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 border ${
                              item.priority?.toLowerCase() === 'high' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-50 text-stone-600 border-stone-200'
                            }`}>
                              {item.priority}
                            </span>
                            <button
                              onClick={() => handleAddTaskAsReminder(item.task)}
                              className="text-[10px] text-stone-400 hover:text-stone-900 transition-colors"
                              title="Add to reminders"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {phase.milestone && (
                      <div className="text-[11px] text-emerald-900 bg-emerald-50/60 p-2 border border-emerald-100 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          <strong>{isHindi ? 'मील का पत्थर (Milestone): ' : 'Milestone: '}</strong>
                          {phase.milestone}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Budget Estimates Table with Verified vs Estimate distinction */}
          {plan.budgetEstimates && plan.budgetEstimates.length > 0 && (
            <div className="p-5 bg-white border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {isHindi ? 'बजट अनुमान एवं वित्तीय योजना' : 'Budget Estimates & Cost Breakdown'}
                </h4>
                <DollarSign className="w-4 h-4 text-stone-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                      <th className="p-2.5 font-semibold">{isHindi ? 'मद / संसाधन' : 'Item / Resource'}</th>
                      <th className="p-2.5 font-semibold">{isHindi ? 'अनुमानित लागत' : 'Estimated Cost (₹)'}</th>
                      <th className="p-2.5 font-semibold">{isHindi ? 'तथ्य बनाम अनुमान' : 'Fact vs Estimate'}</th>
                      <th className="p-2.5 font-semibold">{isHindi ? 'लागत बचत युक्ति' : 'Cost Saving Tip'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {plan.budgetEstimates.map((b, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="p-2.5 font-semibold text-stone-900">{b.item}</td>
                        <td className="p-2.5 font-mono text-stone-900">{b.estimatedCost}</td>
                        <td className="p-2.5">
                          <FactBadge
                            type={
                              b.isFactOrEstimate?.toLowerCase().includes('fact')
                                ? 'fact'
                                : b.isFactOrEstimate?.toLowerCase().includes('estimate')
                                ? 'estimate'
                                : 'assumption'
                            }
                            text={b.isFactOrEstimate}
                          />
                        </td>
                        <td className="p-2.5 text-stone-600">{b.costSavingTip || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Decision Matrix */}
          {plan.decisionMatrix && plan.decisionMatrix.options?.length > 0 && (
            <div className="p-5 bg-white border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {isHindi ? 'निर्णय मैट्रिक्स (Decision Matrix)' : 'Weighted Decision Matrix'}
                </h4>
                <Table className="w-4 h-4 text-stone-400" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                      <th className="p-2.5 font-semibold">{isHindi ? 'विकल्प' : 'Option'}</th>
                      {plan.decisionMatrix.criteria?.map((c, cIdx) => (
                        <th key={cIdx} className="p-2.5 font-semibold text-center">{c}</th>
                      ))}
                      <th className="p-2.5 font-semibold text-center">{isHindi ? 'कुल स्कोर' : 'Total Score'}</th>
                      <th className="p-2.5 font-semibold">{isHindi ? 'टिप्पणी' : 'Analysis'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {plan.decisionMatrix.options.map((opt, oIdx) => (
                      <tr key={oIdx} className="hover:bg-stone-50/50">
                        <td className="p-2.5 font-bold text-stone-900">{opt.optionName}</td>
                        {plan.decisionMatrix.criteria?.map((c, cIdx) => (
                          <td key={cIdx} className="p-2.5 text-center font-mono text-stone-700">
                            {opt.scores?.[c] ?? '—'}
                          </td>
                        ))}
                        <td className="p-2.5 text-center font-mono font-bold text-stone-900 bg-stone-50">
                          {opt.totalScore}
                        </td>
                        <td className="p-2.5 text-stone-600 leading-snug">{opt.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {plan.decisionMatrix.recommendation && (
                <div className="p-3 bg-stone-100 border border-stone-200 text-xs text-stone-800">
                  <strong>{isHindi ? 'मैट्रिक्स निष्कर्ष: ' : 'Matrix Conclusion: '}</strong>
                  {plan.decisionMatrix.recommendation}
                </div>
              )}
            </div>
          )}

          {/* Epistemic Breakdown (Verified facts, Estimates, Assumptions) */}
          {plan.epistemicBreakdown && (
            <div className="p-5 bg-stone-50 border border-stone-200 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 block">
                {isHindi ? 'साक्ष्य व ज्ञानमीमांसा वर्गीकरण' : 'Epistemic Discipline Breakdown'}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white border border-stone-200 space-y-1.5">
                  <FactBadge type="fact" text={isHindi ? 'पुष्ट तथ्य' : 'Verified Facts'} />
                  <ul className="space-y-1 text-stone-700">
                    {plan.epistemicBreakdown.verifiedFacts?.map((f, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-emerald-600">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white border border-stone-200 space-y-1.5">
                  <FactBadge type="estimate" text={isHindi ? 'बाजार अनुमान' : 'Estimates'} />
                  <ul className="space-y-1 text-stone-700">
                    {plan.epistemicBreakdown.estimates?.map((e, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-amber-600">~</span>
                        <span>{e}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-white border border-stone-200 space-y-1.5">
                  <FactBadge type="assumption" text={isHindi ? 'मान्यताएं (जांच योग्य)' : 'Assumptions'} />
                  <ul className="space-y-1 text-stone-700">
                    {plan.epistemicBreakdown.assumptions?.map((a, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-stone-400">?</span>
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
