import React from 'react';
import { ShieldCheck, HelpCircle, AlertCircle } from 'lucide-react';

interface FactBadgeProps {
  type: 'fact' | 'estimate' | 'assumption' | 'verified';
  text?: string;
}

export const FactBadge: React.FC<FactBadgeProps> = ({ type, text }) => {
  if (type === 'fact' || type === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-800">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>{text || 'Verified Fact'}</span>
      </span>
    );
  }

  if (type === 'estimate') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800">
        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
        <span>{text || 'Estimate'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
      <AlertCircle className="w-3.5 h-3.5 text-stone-500" />
      <span>{text || 'Assumption / Developing'}</span>
    </span>
  );
};
