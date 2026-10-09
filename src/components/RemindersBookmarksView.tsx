import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Reminder, HistoryItem } from '../types';
import { AudioReaderButton } from './AudioReaderButton';
import { SourcesList } from './SourcesList';
import {
  Bell,
  Bookmark as BookmarkIcon,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  History,
  Clock,
  ArrowRight,
  Filter,
  FileDown,
} from 'lucide-react';

export const RemindersBookmarksView: React.FC = () => {
  const {
    language,
    reminders,
    addReminder,
    toggleReminder,
    deleteReminder,
    bookmarks,
    removeBookmark,
    history,
    clearHistory,
    requestExternalAction,
  } = useApp();

  const isHindi = language === 'hi';
  const [activeTab, setActiveTab] = useState<'reminders' | 'bookmarks' | 'history'>('reminders');
  const [searchQuery, setSearchQuery] = useState('');

  // Reminder form
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newCategory, setNewCategory] = useState<'Medical' | 'News' | 'Home' | 'General'>('Medical');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addReminder({
      title: newTitle.trim(),
      dueDate: newDate,
      priority: newPriority,
      completed: false,
      category: newCategory,
    });
    setNewTitle('');
    setShowAddForm(false);
  };

  const handleExportData = () => {
    requestExternalAction({
      title: isHindi ? 'व्यक्तिगत डेटा निर्यात' : 'Export Personal Knowledge Vault',
      description: isHindi
        ? 'आप अपने बुकमार्क, रिमाइंडर और खोज इतिहास को JSON फाइल के रूप में डाउनलोड करने जा रहे हैं।'
        : 'You are downloading your local bookmarks, reminders, and history as a secure JSON backup.',
      actionLabel: isHindi ? 'डाउनलोड करें' : 'Download JSON',
      target: 'Browser Download',
      onConfirm: () => {
        const payload = {
          exportDate: new Date().toISOString(),
          reminders,
          bookmarks,
          history,
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI_Doctor_Personal_Assistant_Data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
    });
  };

  // Filtered lists
  const filteredReminders = reminders.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookmarks = bookmarks.filter(
    b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredHistory = history.filter(
    h =>
      h.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            {isHindi ? 'रिमाइंडर, बुकमार्क एवं इतिहास' : 'Reminders, Bookmarks & History Vault'}
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            {isHindi
              ? 'सहेजी गई रिसर्च, फॉलो-अप अनुस्मारक और स्थानीय खोज इतिहास का प्रबंधन करें।'
              : 'Organize clinical follow-ups, saved articles, and searchable research sessions.'}
          </p>
        </div>

        <button
          onClick={handleExportData}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 hover:bg-stone-50 transition-colors self-start sm:self-auto"
        >
          <FileDown className="w-3.5 h-3.5" />
          <span>{isHindi ? 'डेटा बैकअप (Export)' : 'Backup Data (JSON)'}</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 bg-stone-100 border border-stone-200 self-start">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'reminders'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{isHindi ? 'रिमाइंडर' : 'Reminders'}</span>
            <span className="font-mono text-[10px] text-stone-500">({reminders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            <span>{isHindi ? 'बुकमार्क' : 'Bookmarks'}</span>
            <span className="font-mono text-[10px] text-stone-500">({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'bg-white text-stone-900 shadow-2xs border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{isHindi ? 'खोज इतिहास' : 'History'}</span>
            <span className="font-mono text-[10px] text-stone-500">({history.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={isHindi ? 'खोजें...' : 'Search items...'}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 focus:outline-hidden focus:border-stone-500"
          />
        </div>
      </div>

      {/* 1. Reminders Tab Content */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {isHindi ? 'दैनिक अनुस्मारक सूची' : 'Scheduled Reminders'}
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHindi ? 'नया रिमाइंडर जोड़ें' : 'Create Reminder'}</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddReminder} className="p-4 bg-white border border-stone-200 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">
                  {isHindi ? 'रिमाइंडर शीर्षक' : 'Reminder Title'}
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder={
                    isHindi
                      ? 'उदा. आईजीएमसी शिमला ओपीडी टोकन बुक करें...'
                      : 'e.g. Schedule SMS Jaipur follow-up visit, check HAMIRPUR tender...'
                  }
                  className="w-full p-2 text-xs border border-stone-200 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    {isHindi ? 'नियत तिथि (Due Date)' : 'Due Date'}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full p-1.5 text-xs border border-stone-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    {isHindi ? 'प्राथमिकता' : 'Priority'}
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full p-1.5 text-xs border border-stone-200"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    {isHindi ? 'श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-1.5 text-xs border border-stone-200"
                  >
                    <option value="Medical">Medical</option>
                    <option value="News">News</option>
                    <option value="Home">Home</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 border border-stone-200"
                >
                  {isHindi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800"
                >
                  {isHindi ? 'सहेजें' : 'Save Reminder'}
                </button>
              </div>
            </form>
          )}

          {filteredReminders.length === 0 ? (
            <div className="p-8 text-center bg-white border border-stone-200 text-xs text-stone-500">
              {isHindi ? 'कोई रिमाइंडर नहीं मिला।' : 'No reminders matching search criteria.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredReminders.map(rem => (
                <div
                  key={rem.id}
                  className={`p-3.5 bg-white border border-stone-200 flex items-center justify-between gap-3 transition-opacity ${
                    rem.completed ? 'opacity-60 bg-stone-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`mt-0.5 ${rem.completed ? 'text-emerald-600' : 'text-stone-300 hover:text-stone-700'}`}
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div>
                      <div className={`text-xs font-semibold ${rem.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                        {rem.title}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                        <span>Due: {rem.dueDate}</span>
                        <span>·</span>
                        <span className="font-mono">{rem.category}</span>
                        <span>·</span>
                        <span className={`font-semibold ${
                          rem.priority === 'High' ? 'text-rose-700' : rem.priority === 'Medium' ? 'text-amber-700' : 'text-stone-500'
                        }`}>
                          {rem.priority} Priority
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="text-stone-300 hover:text-rose-600 p-1.5 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. Bookmarks Tab Content */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
            {isHindi ? 'सहेजी गई सामग्री एवं स्रोत' : 'Saved Knowledge & Grounded Reports'}
          </span>

          {filteredBookmarks.length === 0 ? (
            <div className="p-8 text-center bg-white border border-stone-200 text-xs text-stone-500">
              {isHindi ? 'कोई बुकमार्क नहीं मिला।' : 'No bookmarks found. Use the bookmark icon on any card to save it.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookmarks.map(bm => (
                <div key={bm.id} className="p-5 bg-white border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500 border-b border-stone-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold uppercase tracking-wider text-stone-700">{bm.type}</span>
                      <span>·</span>
                      <span>{bm.dateAdded}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <AudioReaderButton text={`${bm.title}. ${bm.snippet}`} />
                      <button
                        onClick={() => removeBookmark(bm.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-stone-900">{bm.title}</h4>
                  <p className="text-xs text-stone-700 leading-relaxed">{bm.snippet}</p>

                  <SourcesList sources={bm.sources} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. History Tab Content */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              {isHindi ? 'सत्र इतिहास' : 'Search & Query Session Log'}
            </span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-rose-700 hover:text-rose-900 font-semibold"
              >
                {isHindi ? 'इतिहास साफ़ करें' : 'Clear History'}
              </button>
            )}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="p-8 text-center bg-white border border-stone-200 text-xs text-stone-500">
              {isHindi ? 'कोई गतिविधि इतिहास नहीं है।' : 'No session activity recorded.'}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map(h => (
                <div key={h.id} className="p-3 bg-white border border-stone-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500">
                      <span className="font-semibold text-stone-700">{h.type}</span>
                      <span>·</span>
                      <span>{h.timestamp}</span>
                    </div>
                    <div className="font-medium text-stone-900 mt-0.5">{h.query}</div>
                    {h.preview && <div className="text-stone-500 text-[11px] mt-0.5">{h.preview}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
