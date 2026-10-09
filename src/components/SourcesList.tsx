import React from 'react';
import { GroundingSource } from '../types';
import { useApp } from '../context/AppContext';
import { ExternalLink, Globe } from 'lucide-react';

interface SourcesListProps {
  sources?: GroundingSource[];
  className?: string;
}

export const SourcesList: React.FC<SourcesListProps> = ({ sources = [], className = '' }) => {
  const { requestExternalAction, language } = useApp();

  if (!sources || sources.length === 0) return null;

  const isHindi = language === 'hi';

  const handleSourceClick = (e: React.MouseEvent, source: GroundingSource) => {
    e.preventDefault();
    requestExternalAction({
      title: isHindi ? 'सत्यापित स्रोत खोलें' : 'Open Grounded Web Source',
      description: isHindi
        ? `आप बाहरी वेब स्रोत पर जा रहे हैं: "${source.title}". क्या आप आगे बढ़ना चाहते हैं?`
        : `You are about to open the external verified source: "${source.title}". Do you wish to proceed?`,
      actionLabel: isHindi ? 'वेबसाइट खोलें' : 'Open Link',
      target: source.url,
      onConfirm: () => {
        window.open(source.url, '_blank', 'noopener,noreferrer');
      },
    });
  };

  return (
    <div className={`mt-4 pt-3 border-t border-stone-200/80 ${className}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 mb-2">
        <Globe className="w-3.5 h-3.5 text-stone-500" />
        <span>{isHindi ? 'लाइव सत्यापित स्रोत और संदर्भ' : 'Live Grounded Citations & Sources'}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {sources.map((s, idx) => (
          <button
            key={idx}
            onClick={(e) => handleSourceClick(e, s)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-700 bg-stone-100/70 hover:bg-stone-200/80 border border-stone-200 transition-colors text-left max-w-xs truncate"
            title={s.title}
          >
            <span className="truncate">{s.title || s.url}</span>
            <ExternalLink className="w-3 h-3 text-stone-400 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
