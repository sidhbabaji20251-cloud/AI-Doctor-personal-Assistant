import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sliders,
  Shield,
  Layers,
  Globe,
  Plus,
  X,
  Volume2,
  Trash2,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { language, setLanguage, settings, updateSettings, clearHistory } = useApp();
  const isHindi = language === 'hi';

  const [newNewsTopic, setNewNewsTopic] = useState('');
  const [newMedTopic, setNewMedTopic] = useState('');
  const [newSource, setNewSource] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  const showSaveNotice = () => {
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleAddNewsTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNewsTopic.trim()) return;
    updateSettings({
      customNewsTopics: [...settings.customNewsTopics, newNewsTopic.trim()],
    });
    setNewNewsTopic('');
    showSaveNotice();
  };

  const handleRemoveNewsTopic = (topic: string) => {
    updateSettings({
      customNewsTopics: settings.customNewsTopics.filter(t => t !== topic),
    });
    showSaveNotice();
  };

  const handleAddMedTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedTopic.trim()) return;
    updateSettings({
      customMedicalTopics: [...settings.customMedicalTopics, newMedTopic.trim()],
    });
    setNewMedTopic('');
    showSaveNotice();
  };

  const handleRemoveMedTopic = (topic: string) => {
    updateSettings({
      customMedicalTopics: settings.customMedicalTopics.filter(t => t !== topic),
    });
    showSaveNotice();
  };

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.trim()) return;
    updateSettings({
      trustedSources: [...settings.trustedSources, newSource.trim()],
    });
    setNewSource('');
    showSaveNotice();
  };

  const handleRemoveSource = (src: string) => {
    updateSettings({
      trustedSources: settings.trustedSources.filter(s => s !== src),
    });
    showSaveNotice();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-500 text-xs font-semibold uppercase tracking-wider mb-1">
          <Sliders className="w-4 h-4 text-stone-700" />
          <span>{isHindi ? 'प्रशासक सेटिंग्स एवं प्राथमिकताएं' : 'Administrator & Assistant Preferences'}</span>
        </div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
          {isHindi ? 'कस्टमाइज़ेशन व स्रोत प्रबंधन' : 'Topics, Priorities & Privacy Settings'}
        </h2>
        <p className="text-sm text-stone-600 mt-1">
          {isHindi
            ? 'निगरानी विषय जोड़ें, प्राथमिकताएं बदलें, विश्वसनीय स्रोतों का प्रबंधन करें और गोपनीयता नियमों को नियंत्रित करें।'
            : 'Configure regional priorities, add custom medical & news desks, manage trusted sources, and adjust privacy safety guards.'}
        </p>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{isHindi ? 'सेटिंग्स सफलतापूर्वक अपडेट की गईं।' : 'Preferences saved successfully.'}</span>
        </div>
      )}

      {/* 1. Regional Priorities & Language */}
      <div className="p-5 bg-white border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <Globe className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-bold text-stone-900">
            {isHindi ? 'भाषा एवं क्षेत्रीय प्राथमिकताएं' : 'Language & Regional Priorities'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1.5">
              {isHindi ? 'डिफ़ॉल्ट भाषा (Default Language)' : 'Default Assistant Language'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 text-xs font-semibold border transition-colors ${
                  language === 'en'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`flex-1 py-2 text-xs font-semibold border transition-colors ${
                  language === 'hi'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-stone-700 mb-1">
              {isHindi ? 'क्षेत्रीय बुलेटिन प्राथमिकताएं' : 'Feed Priority Balancing'}
            </label>
            <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.prioritizeHP}
                onChange={e => {
                  updateSettings({ prioritizeHP: e.target.checked });
                  showSaveNotice();
                }}
                className="w-4 h-4 accent-stone-900"
              />
              <span>{isHindi ? 'हिमाचल प्रदेश (शिमला/कांगड़ा/हमीरपुर) को वरीयता दें' : 'Prioritize Himachal Pradesh (Shimla / Kangra / Hamirpur)'}</span>
            </label>

            <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.prioritizeRajasthan}
                onChange={e => {
                  updateSettings({ prioritizeRajasthan: e.target.checked });
                  showSaveNotice();
                }}
                className="w-4 h-4 accent-stone-900"
              />
              <span>{isHindi ? 'राजस्थान व जयपुर समाचार को वरीयता दें' : 'Prioritize Rajasthan & Jaipur Regional Feed'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 2. Custom News Topics */}
      <div className="p-5 bg-white border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">
              {isHindi ? 'कस्टम समाचार विषय (Admin Custom Topics)' : 'Custom News Topics to Monitor'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleAddNewsTopic} className="flex gap-2">
          <input
            type="text"
            value={newNewsTopic}
            onChange={e => setNewNewsTopic(e.target.value)}
            placeholder={isHindi ? 'नया समाचार विषय जोड़ें (उदा. जयपुर मेट्रो विस्तार)...' : 'Add custom topic to track (e.g. Kangra Airport expansion)...'}
            className="flex-1 p-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {settings.customNewsTopics.map((topic, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 border border-stone-200 text-stone-800"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => handleRemoveNewsTopic(topic)}
                className="text-stone-400 hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 3. Custom Medical Research Topics */}
      <div className="p-5 bg-white border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">
              {isHindi ? 'चिकित्सा अनुसंधान विषय (Custom Medical Desks)' : 'Medical Research Topics to Track'}
            </h3>
          </div>
        </div>

        <div className="text-xs text-stone-500">
          <strong>{isHindi ? 'स्थायी कोर विषय: ' : 'Standard Core Topics: '}</strong>
          <span>Diabetes Mellitus · Schizophrenia · Kidney Disease · Heart Disease</span>
        </div>

        <form onSubmit={handleAddMedTopic} className="flex gap-2">
          <input
            type="text"
            value={newMedTopic}
            onChange={e => setNewMedTopic(e.target.value)}
            placeholder={isHindi ? 'नया रोग या शोध क्षेत्र जोड़ें (उदा. थायरॉइड, फैटी लिवर)...' : 'Add specialty topic (e.g. Rheumatoid Arthritis, NAFLD)...'}
            className="flex-1 p-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {settings.customMedicalTopics.map((topic, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 border border-stone-200 text-stone-800"
            >
              <span>{topic}</span>
              <button
                type="button"
                onClick={() => handleRemoveMedTopic(topic)}
                className="text-stone-400 hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 4. Trusted Sources Manager */}
      <div className="p-5 bg-white border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-stone-700" />
            <h3 className="text-sm font-bold text-stone-900">
              {isHindi ? 'सत्यापित स्रोत एवं व्हाइटलिस्ट' : 'Trusted Sources Whitelist'}
            </h3>
          </div>
        </div>

        <form onSubmit={handleAddSource} className="flex gap-2">
          <input
            type="text"
            value={newSource}
            onChange={e => setNewSource(e.target.value)}
            placeholder={isHindi ? 'विश्वसनीय स्रोत जोड़ें (उदा. PTI, The Tribune)...' : 'Add trusted source (e.g. PTI, The Tribune, NEJM)...'}
            className="flex-1 p-2 text-xs bg-stone-50/50 border border-stone-200 focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {settings.trustedSources.map((source, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-stone-100 border border-stone-200 text-stone-800"
            >
              <span>{source}</span>
              <button
                type="button"
                onClick={() => handleRemoveSource(source)}
                className="text-stone-400 hover:text-rose-600"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 5. Privacy, Audio & Safety Controls */}
      <div className="p-5 bg-white border border-stone-200 space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-2">
          <Lock className="w-4 h-4 text-stone-700" />
          <h3 className="text-sm font-bold text-stone-900">
            {isHindi ? 'गोपनीयता, सुरक्षा एवं ध्वनि सेटिंग्स' : 'Privacy Protection & Action Safety'}
          </h3>
        </div>

        <div className="space-y-3 text-xs">
          {/* External Action Approval Guard */}
          <label className="flex items-start gap-2.5 text-stone-700 cursor-pointer p-3 bg-stone-50 border border-stone-200">
            <input
              type="checkbox"
              checked={settings.requireApprovalForExternalActions}
              onChange={e => {
                updateSettings({ requireApprovalForExternalActions: e.target.checked });
                showSaveNotice();
              }}
              className="w-4 h-4 accent-stone-900 mt-0.5"
            />
            <div>
              <div className="font-semibold text-stone-900">
                {isHindi ? 'बाहरी कार्रवाई से पूर्व उपयोगकर्ता स्वीकृति अनिवार्य रखें' : 'Require Explicit User Approval Before External Actions'}
              </div>
              <p className="text-stone-500 mt-0.5 leading-relaxed">
                {isHindi
                  ? 'बाहरी लिंक खोलने, फ़ोन कॉल करने या डेटा निर्यात करने से पूर्व हमेशा पुष्टिकरण संवाद दिखाएगा।'
                  : 'Displays an explicit confirmation modal before navigating to external websites or initiating telephone calls.'}
              </p>
            </div>
          </label>

          {/* Voice Narration */}
          <label className="flex items-center gap-2.5 text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableAudioNarration}
              onChange={e => {
                updateSettings({ enableAudioNarration: e.target.checked });
                showSaveNotice();
              }}
              className="w-4 h-4 accent-stone-900"
            />
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-stone-500" />
              <span>{isHindi ? 'आवाज़ में वाचन (Text-to-Speech) सक्षम रखें' : 'Enable Read-Aloud Voice Buttons'}</span>
            </div>
          </label>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <span className="text-stone-500">
              {isHindi ? 'स्थानीय सत्र इतिहास को पूरी तरह साफ़ करें' : 'Clear local session search history'}
            </span>
            <button
              onClick={() => {
                clearHistory();
                alert(isHindi ? 'इतिहास साफ़ कर दिया गया।' : 'Session history wiped.');
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-rose-700 hover:text-rose-900 border border-rose-200 hover:bg-rose-50 font-semibold"
            >
              <Trash2 className="w-3 h-3" />
              <span>{isHindi ? 'इतिहास साफ़ करें' : 'Clear History'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Freeware Distribution & Owner Integrated API Section */}
      <div className="bg-amber-50 border-2 border-stone-900 p-5 space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-red-700 text-white font-bold text-[10px]">FREEWARE</span>
            <h3 className="font-bold text-sm text-stone-900">
              {isHindi ? 'फ्रीवेयर वितरण व इंटीग्रेटेड API' : 'Freeware Distribution & Integrated API'}
            </h3>
          </div>
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[10px]">
            OWNER VERIFIED
          </span>
        </div>

        <p className="font-sans text-stone-700 text-xs leading-relaxed">
          {isHindi
            ? 'यह संपूर्ण मेडिकल व समाचार प्लेटफॉर्म ओनर (sidhbabaji20251@gmail.com) द्वारा एक अधिकृत वेब URL के रूप में फ्रीवेयर के तौर पर साझा किया जाता है। इसमें टेस्टिंग व स्वास्थ्य विज्ञापन (Advertising) हेतु इंटीग्रेटेड API पहले से अंतर्निहित है।'
            : 'This complete clinical and intelligence platform is distributed 100% free of charge by the owner (sidhbabaji20251@gmail.com) as a shareable web URL for testing, Golwala prescriber reference, and integrated healthcare advertising.'}
        </p>

        <div className="p-3 bg-white border border-stone-300 space-y-1 text-[11px] text-stone-800">
          <div><strong>Distribution Model:</strong> Direct Web URL sent exclusively by owner</div>
          <div><strong>Owner Contact:</strong> sidhbabaji20251@gmail.com</div>
          <div><strong>Integrated API Capabilities:</strong> Gemini 3.8 Flash, Golwala 50+ Prescriptions, SMC Pad PDF, Drug Substitutes, Advertising Engine</div>
        </div>
      </div>
    </div>
  );
};
