import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { runMarketResearch } from '../services/api';
import { MarketResearchData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import {
  ShoppingBag,
  Search,
  RefreshCw,
  TrendingUp,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Bookmark,
  Coins,
  Compass,
} from 'lucide-react';

export const MarketResearchView: React.FC = () => {
  const { language, addBookmark, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('India (Rajasthan / HP / National)');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MarketResearchData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sampleQueries = [
    {
      titleEn: 'Best Water Softeners / Scale Reducers for Home',
      titleHi: 'घर के लिए बेस्ट वाटर सॉफ्टनर व स्केलिंग रिड्यूसर',
      qEn: 'Best home water softeners and anti-scaling systems for high TDS water in Jaipur, India',
      qHi: 'जयपुर राजस्थान में हाई टीडीएस खारे पानी के लिए बेस्ट घरेलू वाटर सॉफ्टनर और एंटी-स्केलिंग डिवाइस',
      budget: '₹8,000 - ₹25,000',
    },
    {
      titleEn: '3kW On-Grid Solar Inverter & Panels (PM Surya Ghar)',
      titleHi: '3kW सोलर इन्वर्टर व पैनल्स (पीएम सूर्य घर)',
      qEn: 'Current prices, best brands (Tata Power Solar, Waaree, Loom), subsidy process in Rajasthan for 3kW rooftop solar',
      qHi: 'राजस्थान में 3kW रूफटॉप सोलर के नवीनतम दाम, टॉप ब्रांड्स (टाटा पावर, वारी) और सब्सिडी प्रक्रिया',
      budget: '₹1,50,000 - ₹2,00,000',
    },
    {
      titleEn: 'Digital Blood Pressure Monitors & Glucometers',
      titleHi: 'डिजिटल बीपी मॉनिटर और ग्लूकोमीटर मशीन',
      qEn: 'Most accurate digital BP monitor (Omron) and CGM continuous glucose monitors (Freestyle Libre) prices in India',
      qHi: 'भारत में सबसे सटीक डिजिटल बीपी मशीन और सीजीएम ग्लूकोमीटर के दाम और स्ट्रिप्स का खर्च',
      budget: '₹2,000 - ₹6,000',
    },
    {
      titleEn: 'Inverter + Tall Tubular Battery for Power Outages',
      titleHi: 'होम इन्वर्टर और ट्यूबलर बैटरी कॉम्बो',
      qEn: 'Best home inverter with 150Ah/200Ah tall tubular battery for mountain/semi-urban power backup (Luminous, Microtek)',
      qHi: 'पहाड़ी और अर्ध-शहरी क्षेत्रों के लिए बेस्ट 150Ah/200Ah ट्यूबलर बैटरी और इन्वर्टर कॉम्बो (ल्यूमिनस, माइक्रोटेक)',
      budget: '₹18,000 - ₹25,000',
    },
  ];

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await runMarketResearch(query, budget, location, language);
      if (response.success && response.data) {
        setResult(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'Market Research',
          query: query.slice(0, 50),
          preview: response.data.evidenceBasedRecommendation.slice(0, 80) + '...',
        });
      } else {
        setError(response.error || 'Failed to retrieve market research data.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: any) => {
    setQuery(isHindi ? sample.qHi : sample.qEn);
    setBudget(sample.budget);
  };

  const handleBookmark = () => {
    if (!result) return;
    addBookmark({
      type: 'market-research',
      title: query,
      snippet: result.evidenceBasedRecommendation.slice(0, 140) + '...',
      data: result,
      sources: sources,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <ShoppingBag className="w-4 h-4 text-stone-700" />
          <span>{isHindi ? 'लाइव बाजार अनुसंधान एवं मूल्य तुलना' : 'Live Market Intelligence & Price Comparison'}</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          {isHindi ? 'मार्केट रिसर्च एजेंट' : 'Market Research Agent'}
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {isHindi
            ? 'लाइव वेब स्रोतों से वास्तविक उत्पाद, वर्तमान कीमतें (₹ INR), प्रतिस्पर्धियों के विकल्प, समीक्षाएं और बजट सिफारिशें खोजें।'
            : 'Live web intelligence on products, services, local & national prices in ₹, competitor tiers, customer sentiment, and evidence-based recommendations.'}
        </p>
      </div>

      {/* Input Box */}
      <div className="p-5 bg-white border border-stone-200 shadow-2xs space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-stone-600">
                {isHindi ? 'उत्पाद, सेवा या बाजार क्वेरी' : 'Product, Service, or Market Query'}
              </label>
              <VoiceInputButton
                onTranscript={transcript => {
                  setQuery(prev => (prev ? `${prev} ${transcript}` : transcript));
                }}
                placeholderText={isHindi ? 'बोलकर उत्पाद खोजें' : 'Speak product query'}
              />
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={
                  isHindi
                    ? 'उदा. बेस्ट होम वाटर प्यूरीफायर, सोलर पैनल, इन्वर्टर बैटरी, ग्लूकोमीटर, ई-रिक्शा...'
                    : 'e.g. Best 1.5 ton 5-star inverter AC for hot dry summer, rooftop solar panels, hospital diagnostics lab pricing...'
                }
                className="w-full pl-9 pr-4 py-2.5 text-xs text-stone-900 bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                {isHindi ? 'बजट सीमा (वैकल्पिक)' : 'Budget Target (Optional)'}
              </label>
              <input
                type="text"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder={isHindi ? 'उदा. ₹10,000 के अंदर या किफायती' : 'e.g. Under ₹20,000, or Best Value'}
                className="w-full px-3 py-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                {isHindi ? 'बाजार क्षेत्र / स्थान' : 'Target Market / Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="India, Rajasthan, Himachal Pradesh"
                className="w-full px-3 py-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
              />
            </div>
          </div>

          {/* Quick sample chips */}
          <div>
            <span className="text-[11px] font-medium text-stone-500 block mb-1.5">
              {isHindi ? 'लोकप्रिय घरेलू अनुसंधान क्वेरी:' : 'Popular Home Research Queries:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {sampleQueries.map((s, idx) => (
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
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHindi ? 'लाइव बाजार खोज जारी है...' : 'Scanning Live Market Prices...'}</span>
                </>
              ) : (
                <>
                  <Compass className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लाइव बाजार विश्लेषण करें' : 'Run Market Research'}</span>
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

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Executive Overview & Recommendation */}
          <div className="p-5 bg-white border border-stone-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                  {isHindi ? 'बाजार अवलोकन' : 'Market Landscape Overview'}
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-0.5">
                  {query}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <AudioReaderButton text={`${result.marketOverview}. Recommendation: ${result.evidenceBasedRecommendation}`} />
                <button
                  onClick={handleBookmark}
                  className="p-1.5 text-xs border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors"
                  title="Bookmark"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-sm text-stone-800 leading-relaxed font-serif sm:font-sans">
              {result.marketOverview}
            </p>
          </div>

          {/* Budget Options Trio (Budget / Value / Premium) */}
          {result.budgetOptions && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-stone-50 border border-stone-200 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
                  {isHindi ? 'किफायती विकल्प (Budget Pick)' : 'Budget Pick'}
                </span>
                <div className="text-xs font-bold text-stone-900">
                  {result.budgetOptions.budgetPick}
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">
                  {isHindi ? 'सर्वोत्तम मूल्य (Value for Money)' : 'Value for Money'}
                </span>
                <div className="text-xs font-bold text-amber-950">
                  {result.budgetOptions.valuePick}
                </div>
              </div>

              <div className="p-4 bg-stone-100 border border-stone-300 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-700">
                  {isHindi ? 'प्रीमियम विकल्प (Premium Pick)' : 'Premium / Flagship Pick'}
                </span>
                <div className="text-xs font-bold text-stone-950">
                  {result.budgetOptions.premiumPick}
                </div>
              </div>
            </div>
          )}

          {/* Comparison Table */}
          {result.comparisonTable && result.comparisonTable.length > 0 && (
            <div className="p-5 bg-white border border-stone-200 space-y-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? 'उत्पाद एवं मूल्य तुलना तालिका' : 'Product & Pricing Comparison Matrix'}
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 bg-stone-50 text-stone-600">
                      <th className="p-3 font-semibold">{isHindi ? 'उत्पाद / मॉडल' : 'Product / Model'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'श्रेणी (Tier)' : 'Tier'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'अनुमानित मूल्य' : 'Approx Price (₹)'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'मुख्य विशेषताएं' : 'Key Features'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'गुण (Pros)' : 'Pros'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'दोष (Cons)' : 'Cons'}</th>
                      <th className="p-3 font-semibold">{isHindi ? 'निर्णय' : 'Verdict'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {result.comparisonTable.map((item, idx) => (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="p-3 font-bold text-stone-900 whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 border border-stone-200">
                            {item.tier}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-stone-900 whitespace-nowrap">
                          {item.approxPrice}
                        </td>
                        <td className="p-3 max-w-xs text-stone-600 leading-snug">
                          {item.keyFeatures?.join(', ')}
                        </td>
                        <td className="p-3 text-emerald-800 leading-snug">
                          {item.pros?.join(' · ')}
                        </td>
                        <td className="p-3 text-rose-800 leading-snug">
                          {item.cons?.join(' · ')}
                        </td>
                        <td className="p-3 font-medium text-stone-800">
                          {item.verdict}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Evidence-Based Recommendation */}
          {result.evidenceBasedRecommendation && (
            <div className="p-5 bg-stone-900 text-white space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isHindi ? 'साक्ष्य-आधारित खरीद सिफारिश' : 'Evidence-Based Buying Recommendation'}</span>
              </div>
              <p className="text-sm text-stone-100 leading-relaxed font-medium">
                {result.evidenceBasedRecommendation}
              </p>
            </div>
          )}

          {/* Trends and Cautions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.marketTrendsAndOpportunities?.length > 0 && (
              <div className="p-4 bg-stone-50 border border-stone-200 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-stone-500" />
                  <span>{isHindi ? 'बाजार रुझान एवं अवसर' : 'Market Trends & Opportunities'}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {result.marketTrendsAndOpportunities.map((trend, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-500 mt-1.5 shrink-0" />
                      <span>{trend}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.cautions && (
              <div className="p-4 bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  <span>{isHindi ? 'सावधानियां एवं छुपे हुए खर्च' : 'Buyer Cautions & Hidden Costs'}</span>
                </div>
                <p className="text-xs text-amber-950 leading-relaxed">
                  {result.cautions}
                </p>
              </div>
            )}
          </div>

          <SourcesList sources={sources} />
        </div>
      )}
    </div>
  );
};
