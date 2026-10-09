import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { fetchNews, translateText } from '../services/api';
import { NewsData, GroundingSource } from '../types';
import { VoiceInputButton } from './VoiceInputButton';
import { SourcesList } from './SourcesList';
import { AudioReaderButton } from './AudioReaderButton';
import { FactBadge } from './FactBadge';
import {
  Newspaper,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  Languages,
  AlertTriangle,
  Search,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const DailyNewsView: React.FC = () => {
  const { language, addBookmark, removeBookmark, isBookmarked, addHistory } = useApp();
  const isHindi = language === 'hi';

  const [category, setCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);
  const [translatedArticles, setTranslatedArticles] = useState<Record<string, { title: string; summary: string }>>({});

  const categories = [
    { id: 'all', labelEn: 'All Regions', labelHi: 'सभी क्षेत्र' },
    { id: 'jaipur', labelEn: 'Jaipur', labelHi: 'जयपुर' },
    { id: 'rajasthan', labelEn: 'Rajasthan', labelHi: 'राजस्थान' },
    { id: 'himachal', labelEn: 'Himachal Pradesh', labelHi: 'हिमाचल प्रदेश' },
    { id: 'national', labelEn: 'National (India)', labelHi: 'राष्ट्रीय (भारत)' },
    { id: 'international', labelEn: 'International', labelHi: 'अंतर्राष्ट्रीय' },
  ];

  const loadNews = async (cat = category, query = searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchNews(cat, language, query);
      if (response.success && response.data) {
        setNewsData(response.data);
        setSources(response.sources || []);
        addHistory({
          type: 'News Briefing',
          query: `${cat.toUpperCase()} ${query ? `(${query})` : ''}`,
          preview: response.data.summary.slice(0, 80) + '...',
        });
      } else {
        setError(response.error || 'Unable to retrieve news at this moment.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews(category, searchQuery);
  }, [category, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadNews(category, searchQuery);
  };

  const handleTranslateArticle = async (articleId: string, currentTitle: string, currentSummary: string) => {
    if (translatedArticles[articleId]) {
      // Toggle back
      const next = { ...translatedArticles };
      delete next[articleId];
      setTranslatedArticles(next);
      return;
    }

    setTranslatingId(articleId);
    try {
      const targetLang = language === 'hi' ? 'en' : 'hi';
      const textToTranslate = `Title: ${currentTitle}\nSummary: ${currentSummary}`;
      const translated = await translateText(textToTranslate, targetLang);
      
      const lines = translated.split('\n');
      const titleLine = lines.find(l => l.toLowerCase().startsWith('title:')) || lines[0] || currentTitle;
      const cleanTitle = titleLine.replace(/^title:\s*/i, '').trim();
      const summaryPart = lines.filter(l => !l.toLowerCase().startsWith('title:')).join(' ').replace(/^summary:\s*/i, '').trim() || translated;

      setTranslatedArticles(prev => ({
        ...prev,
        [articleId]: {
          title: cleanTitle,
          summary: summaryPart,
        },
      }));
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setTranslatingId(null);
    }
  };

  const handleToggleBookmark = (article: any) => {
    if (isBookmarked(article.title)) {
      const existing = isBookmarked(article.title);
      // handled via context
    } else {
      addBookmark({
        type: 'news',
        title: article.title,
        snippet: article.summary.slice(0, 140) + '...',
        data: article,
        sources: sources,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4 text-stone-700" />
            <span>{isHindi ? 'सत्यापित समाचार सेवा' : 'Verified Daily News Bureau'}</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isHindi ? 'दैनिक सत्यापित समाचार' : 'Daily Verified News Digest'}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isHindi
              ? 'राष्ट्रीय, अंतर्राष्ट्रीय, जयपुर, राजस्थान और हिमाचल प्रदेश के विश्वसनीय समाचार।'
              : 'Reliable coverage spanning National, International, Jaipur, Rajasthan & Himachal Pradesh.'}
          </p>
        </div>

        <button
          onClick={() => loadNews(category, searchQuery)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{isHindi ? 'ताज़ा करें' : 'Refresh Feed'}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100/80 border border-stone-200">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                category === cat.id
                  ? 'bg-white text-stone-900 font-semibold shadow-2xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {isHindi ? cat.labelHi : cat.labelEn}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                isHindi
                  ? 'किसी विशिष्ट समाचार, शहर या विषय को खोजें...'
                  : 'Search specific news topic, project, or event...'
              }
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-stone-200 focus:outline-hidden focus:border-stone-500 transition-colors"
            />
          </div>
          <VoiceInputButton
            onTranscript={transcript => {
              setSearchQuery(transcript);
              loadNews(category, transcript);
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            {isHindi ? 'खोजें' : 'Search'}
          </button>
        </form>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="p-12 text-center bg-white border border-stone-200">
          <RefreshCw className="w-6 h-6 text-stone-400 animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-stone-700">
            {isHindi
              ? 'लाइव स्रोतों से सत्यापित समाचार संकलित किए जा रहे हैं...'
              : 'Verifying news from live sources across Himachal, Rajasthan & National bureaus...'}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            {isHindi ? 'कृपया प्रतीक्षा करें...' : 'Grounding facts with Google Search...'}
          </p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800">
          <div className="flex items-center gap-2 font-semibold text-sm mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span>{isHindi ? 'समाचार प्राप्त करने में समस्या' : 'Unable to load news feed'}</span>
          </div>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            onClick={() => loadNews(category, searchQuery)}
            className="mt-3 px-3 py-1.5 text-xs font-semibold bg-rose-800 text-white hover:bg-rose-900"
          >
            {isHindi ? 'पुनः प्रयास करें' : 'Try Again'}
          </button>
        </div>
      ) : newsData ? (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <div className="p-5 bg-white border border-stone-200">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                {isHindi ? 'दैनिक सारांश' : 'Executive Digest'}
              </span>
              <AudioReaderButton text={newsData.summary} />
            </div>
            <p className="text-sm text-stone-800 leading-relaxed font-serif sm:font-sans">
              {newsData.summary}
            </p>
            {newsData.disclaimer && (
              <p className="text-[11px] text-stone-500 mt-3 pt-2 border-t border-stone-100 italic">
                {newsData.disclaimer}
              </p>
            )}
          </div>

          {/* Articles Grid / List */}
          <div className="space-y-4">
            {newsData.articles?.map((article, idx) => {
              const translated = translatedArticles[article.id];
              const displayTitle = translated ? translated.title : article.title;
              const displaySummary = translated ? translated.summary : article.summary;
              const bookmarked = isBookmarked(article.title);

              return (
                <div
                  key={article.id || idx}
                  className="p-5 bg-white border border-stone-200 transition-shadow hover:border-stone-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 text-xs text-stone-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 font-medium text-stone-700">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        {article.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      {article.publishedTime && (
                        <>
                          <span>{article.publishedTime}</span>
                          <span aria-hidden="true">·</span>
                        </>
                      )}
                      {article.sourceName && (
                        <span className="font-mono text-stone-600">{article.sourceName}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <button
                        onClick={() => handleTranslateArticle(article.id, article.title, article.summary)}
                        disabled={translatingId === article.id}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-xs transition-colors"
                        title={
                          translated
                            ? isHindi ? 'मूल भाषा दिखाएं' : 'Show original'
                            : isHindi ? 'अंग्रेजी में अनुवाद करें' : 'Translate to Hindi'
                        }
                      >
                        <Languages className="w-3.5 h-3.5" />
                      </button>

                      <AudioReaderButton text={`${displayTitle}. ${displaySummary}`} />

                      <button
                        onClick={() => handleToggleBookmark(article)}
                        className={`p-1.5 text-xs transition-colors ${
                          bookmarked
                            ? 'text-amber-800 hover:text-amber-900'
                            : 'text-stone-400 hover:text-stone-700'
                        }`}
                        title={bookmarked ? 'Saved to bookmarks' : 'Save bookmark'}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5 fill-amber-700 text-amber-700" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-stone-900 leading-snug mb-2">
                    {displayTitle}
                  </h3>

                  <p className="text-sm text-stone-700 leading-relaxed mb-3">
                    {displaySummary}
                  </p>

                  {/* Verified Facts list */}
                  {article.verifiedFacts && article.verifiedFacts.length > 0 && (
                    <div className="mt-3 p-3 bg-stone-50 border border-stone-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FactBadge type="fact" text={isHindi ? 'सत्यापित बिंदु' : 'Verified Key Facts'} />
                      </div>
                      <ul className="space-y-1 text-xs text-stone-700">
                        {article.verifiedFacts.map((fact, fIdx) => (
                          <li key={fIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Uncertainties or developing note */}
                  {article.uncertaintiesOrPendingUpdates && (
                    <div className="mt-2 text-xs text-amber-900 bg-amber-50/70 p-2.5 border border-amber-100 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">
                          {isHindi ? 'अद्यतन एवं अनिश्चितता प्रकटीकरण: ' : 'Developing / Uncertainty Disclosure: '}
                        </span>
                        <span>{article.uncertaintiesOrPendingUpdates}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sources Grounding List */}
          <SourcesList sources={sources} />
        </div>
      ) : null}
    </div>
  );
};
