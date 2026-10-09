import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, ExternalLink, Phone, FileDown, X } from 'lucide-react';

export const ExternalActionModal: React.FC = () => {
  const { activeExternalModal, closeExternalModal, language } = useApp();

  if (!activeExternalModal) return null;

  const isHindi = language === 'hi';

  const getIcon = () => {
    if (activeExternalModal.target?.startsWith('tel:')) return <Phone className="w-6 h-6 text-amber-700" />;
    if (activeExternalModal.title.toLowerCase().includes('export')) return <FileDown className="w-6 h-6 text-stone-700" />;
    return <ExternalLink className="w-6 h-6 text-amber-700" />;
  };

  const handleConfirm = () => {
    const action = activeExternalModal.onConfirm;
    closeExternalModal();
    action();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white border border-stone-200 shadow-xl p-6 relative">
        <button
          onClick={closeExternalModal}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5 mb-4">
          <div className="p-2.5 bg-stone-100 rounded-sm">
            {getIcon()}
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{isHindi ? 'बाहरी कार्रवाई सुरक्षा' : 'Action Approval Guard'}</span>
            </div>
            <h3 className="text-base font-semibold text-stone-900 leading-snug">
              {activeExternalModal.title}
            </h3>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-3 leading-relaxed">
          {activeExternalModal.description}
        </p>

        {activeExternalModal.target && (
          <div className="p-2.5 bg-stone-50 border border-stone-200 font-mono text-xs text-stone-700 break-all mb-5">
            {activeExternalModal.target}
          </div>
        )}

        <div className="text-xs text-stone-500 mb-5 border-t border-stone-100 pt-3">
          {isHindi
            ? 'आपकी गोपनीयता सुरक्षित है। बिना आपकी अनुमति के कोई भी बाहरी नेटवर्क अनुरोध निष्पादित नहीं किया जाता है।'
            : 'Your privacy is protected. External navigation and actions require your verified consent.'}
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={closeExternalModal}
            className="px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors"
          >
            {isHindi ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            {activeExternalModal.actionLabel || (isHindi ? 'अनुमति दें और आगे बढ़ें' : 'Approve & Proceed')}
          </button>
        </div>
      </div>
    </div>
  );
};
