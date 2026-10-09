import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VoiceInputButton } from './VoiceInputButton';
import { AudioReaderButton } from './AudioReaderButton';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  AlertCircle,
  Sparkles,
  Calendar,
  CheckCircle2,
  CheckCheck,
  Tag,
} from 'lucide-react';
import { DailyPlannerTask } from '../types';

export const DailyPlannerSection: React.FC = () => {
  const {
    language,
    dailyTasks,
    addDailyTask,
    toggleDailyTask,
    deleteDailyTask,
    deleteCompletedDailyTasks,
    refreshDailyTasksForNewDay,
    todayDateStr,
  } = useApp();

  const isHindi = language === 'hi';

  const [showAddForm, setShowAddForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [priority, setPriority] = useState<'Urgent' | 'High' | 'Normal' | 'Low'>('High');
  const [category, setCategory] = useState<'Health' | 'Household' | 'Professional' | 'Errands' | 'Personal'>('Health');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [justRefreshedNotice, setJustRefreshedNotice] = useState(false);

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const totalCount = dailyTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addDailyTask({
      title: taskTitle.trim(),
      timeSlot: timeSlot.trim() || undefined,
      priority,
      category,
    });

    setTaskTitle('');
    setTimeSlot('');
    setShowAddForm(false);
  };

  const handleManualDailyRefresh = () => {
    refreshDailyTasksForNewDay();
    setJustRefreshedNotice(true);
    setTimeout(() => setJustRefreshedNotice(false), 2500);
  };

  const quickPresets = [
    {
      titleEn: 'Morning blood glucose check & medicine schedule',
      titleHi: 'सुबह का ब्लड ग्लूकोज चेक व दवाइयां लेना',
      cat: 'Health' as const,
      prio: 'Urgent' as const,
      time: '08:00 AM',
    },
    {
      titleEn: 'Check SMS Jaipur & IGMC Shimla OPD notices',
      titleHi: 'एसएमएस जयपुर व आईजीएमसी शिमला ओपीडी नोटिस देखना',
      cat: 'Health' as const,
      prio: 'High' as const,
      time: '11:00 AM',
    },
    {
      titleEn: 'Inspect water purifier filter & geyser scaling',
      titleHi: 'वाटर प्यूरीफायर फिल्टर व गीजर स्केलिंग जांचना',
      cat: 'Household' as const,
      prio: 'Normal' as const,
      time: '04:00 PM',
    },
    {
      titleEn: 'Pay electricity / solar rooftop utility bill',
      titleHi: 'बिजली / सोलर रूफटॉप बिल भुगतान व समीक्षा',
      cat: 'Household' as const,
      prio: 'Normal' as const,
      time: '06:00 PM',
    },
  ];

  const filteredTasks = dailyTasks.filter(t => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const getPriorityStyle = (p: string) => {
    switch (p) {
      case 'Urgent':
        return 'bg-red-100 text-red-900 border-red-300 font-bold';
      case 'High':
        return 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      case 'Normal':
        return 'bg-stone-100 text-stone-800 border-stone-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  const formattedDate = new Date().toLocaleDateString(isHindi ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="p-5 md:p-6 bg-white border border-amber-500/40 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
        <div>
          <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold mb-1">
            <span className="flex items-center gap-1 font-mono text-stone-700 bg-amber-100/90 px-2 py-0.5 border border-amber-300/80">
              <Calendar className="w-3 h-3 text-red-700" />
              <span>{formattedDate}</span>
            </span>
            <span>·</span>
            <span className="text-[11px] text-stone-700 font-medium">
              {isHindi ? 'प्रतिदिन स्वतः ताज़ा होने वाला प्लानर' : 'Auto-Refreshes Everyday'}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-extrabold header-multicolor-red">
            {isHindi ? 'दैनिक कार्य योजना एवं टू-डू लिस्ट' : 'Daily Planner & Action To-Do List'}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <AudioReaderButton
            text={`${isHindi ? 'दैनिक कार्य योजना' : 'Daily Planner'}. ${dailyTasks.length} ${isHindi ? 'कार्य' : 'tasks'}. ${completedCount} ${isHindi ? 'पूर्ण' : 'completed'}. ${dailyTasks.map(t => `${t.title} (${t.completed ? 'completed' : 'pending'})`).join('. ')}`}
          />

          <button
            type="button"
            onClick={handleManualDailyRefresh}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-stone-800 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 transition-colors"
            title={isHindi ? 'सम्पन्न कार्य हटाकर आज का नया दिन शुरू करें' : 'Purge completed tasks & refresh for today'}
          >
            <RefreshCw className="w-3 h-3 text-red-700" />
            <span>{isHindi ? 'दैनिक रिफ्रेश' : 'Refresh Today'}</span>
          </button>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={deleteCompletedDailyTasks}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
              title={isHindi ? 'सभी सम्पन्न कार्य हटाएं' : 'Delete all completed tasks'}
            >
              <Trash2 className="w-3 h-3 text-red-700" />
              <span>{isHindi ? `सम्पन्न हटाएं (${completedCount})` : `Delete Done (${completedCount})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कार्य जोड़ें' : 'Add Task'}</span>
          </button>
        </div>
      </div>

      {justRefreshedNotice && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {isHindi
              ? 'दैनिक प्लानर ताज़ा कर दिया गया: सम्पन्न कार्य हटा दिए गए हैं और लंबित कार्य आज के लिए सक्रिय हैं।'
              : 'Daily planner refreshed: Completed tasks removed and active work rolled forward for today.'}
          </span>
        </div>
      )}

      {/* Progress Metric & Filter Bar */}
      <div className="space-y-2 bg-stone-50/70 p-3 border border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">
              {isHindi ? 'आज की प्रगति:' : "Today's Progress:"}
            </span>
            <span className="font-mono font-semibold text-stone-900">
              {completedCount} / {totalCount} {isHindi ? 'पूर्ण' : 'Completed'}
            </span>
            <span className="font-bold text-red-700 font-mono">({progressPercent}%)</span>
          </div>

          {/* Segmented Filter */}
          <div className="flex items-center gap-1 bg-white p-0.5 border border-stone-200 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHindi ? `सभी (${totalCount})` : `All (${totalCount})`}
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHindi ? `लंबित (${totalCount - completedCount})` : `Pending (${totalCount - completedCount})`}
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                filter === 'completed'
                  ? 'bg-red-700 text-white shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {isHindi ? `सम्पन्न (${completedCount})` : `Done (${completedCount})`}
            </button>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="w-full h-2 bg-stone-200 rounded-xs overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-red-600 to-emerald-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Add Task Inline Form */}
      {showAddForm && (
        <form onSubmit={handleAddTask} className="p-4 bg-amber-50/50 border border-amber-300 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-900">
              {isHindi ? 'नया दैनिक कार्य जोड़ें' : 'Add Work To Be Done'}
            </span>
            <VoiceInputButton
              onTranscript={transcript => {
                setTaskTitle(prev => (prev ? `${prev} ${transcript}` : transcript));
              }}
              placeholderText={isHindi ? 'बोलकर कार्य जोड़ें' : 'Speak task title'}
            />
          </div>

          <div>
            <input
              type="text"
              value={taskTitle}
              onChange={e => setTaskTitle(e.target.value)}
              placeholder={
                isHindi
                  ? 'उदा. डॉक्टर की पर्ची जांचना, इन्वर्टर बैटरी में पानी डालना, सब्जी बाजार...'
                  : 'e.g. Schedule SMS Jaipur token, check water purifier filter, review market prices...'
              }
              className="w-full p-2.5 text-xs bg-white border border-stone-300 focus:outline-hidden focus:border-red-600"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {isHindi ? 'समय / स्लॉट (वैकल्पिक)' : 'Time Slot (Optional)'}
              </label>
              <input
                type="text"
                value={timeSlot}
                onChange={e => setTimeSlot(e.target.value)}
                placeholder={isHindi ? 'उदा. 09:30 AM / दोपहर' : 'e.g. 09:30 AM / Afternoon'}
                className="w-full p-2 bg-white border border-stone-300 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {isHindi ? 'प्राथमिकता' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full p-2 bg-white border border-stone-300 text-xs"
              >
                <option value="Urgent">Urgent (अति आवश्यक)</option>
                <option value="High">High (उच्च)</option>
                <option value="Normal">Normal (सामान्य)</option>
                <option value="Low">Low (निम्न)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                {isHindi ? 'श्रेणी' : 'Category'}
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full p-2 bg-white border border-stone-300 text-xs"
              >
                <option value="Health">Health (स्वास्थ्य)</option>
                <option value="Household">Household (घरेलू)</option>
                <option value="Professional">Professional (कार्य)</option>
                <option value="Errands">Errands (बाहरी काम)</option>
                <option value="Personal">Personal (व्यक्तिगत)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 border border-stone-300"
            >
              {isHindi ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-800 disabled:opacity-50 transition-colors shadow-2xs"
            >
              {isHindi ? 'कार्य सहेजें' : 'Save To Daily Plan'}
            </button>
          </div>
        </form>
      )}

      {/* Quick Presets Strip */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
          {isHindi ? 'त्वरित कार्य टेम्पलेट (Quick Add):' : 'Quick Home & Health Presets:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                addDailyTask({
                  title: isHindi ? preset.titleHi : preset.titleEn,
                  category: preset.cat,
                  priority: preset.prio,
                  timeSlot: preset.time,
                });
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-200 transition-colors"
            >
              <Plus className="w-3 h-3 text-red-700" />
              <span>{isHindi ? preset.titleHi : preset.titleEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2 pt-1">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-300 text-xs text-stone-500 space-y-2">
            <CheckCheck className="w-6 h-6 text-stone-400 mx-auto" />
            <p className="font-semibold text-stone-700">
              {filter === 'completed'
                ? isHindi
                  ? 'कोई सम्पन्न कार्य नहीं है।'
                  : 'No completed tasks yet.'
                : isHindi
                ? 'आज के सभी कार्य सम्पन्न हो चुके हैं! नया कार्य जोड़ने के लिए ऊपर बटन दबाएं।'
                : 'All planned work completed for today! Click "+ Add Task" to plan more.'}
            </p>
            <p className="text-[11px] text-stone-400">
              {isHindi
                ? 'प्लानर कल सुबह नई तारीख के साथ स्वतः रीफ्रेश हो जाएगा।'
                : 'The planner automatically refreshes every morning for the new date.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 border border-stone-200 bg-white">
            {filteredTasks.map(task => {
              return (
                <div
                  key={task.id}
                  className={`flex items-start justify-between gap-3 p-3.5 transition-colors group ${
                    task.completed ? 'bg-stone-50/70 text-stone-400' : 'hover:bg-amber-50/40 text-stone-900'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleDailyTask(task.id)}
                      className="mt-0.5 text-stone-400 hover:text-red-700 shrink-0 transition-colors"
                      title={task.completed ? 'Mark pending' : 'Mark completed'}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5 text-stone-400 hover:text-stone-700" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div
                        onClick={() => toggleDailyTask(task.id)}
                        className={`text-xs font-semibold cursor-pointer select-none leading-snug break-words ${
                          task.completed ? 'line-through text-stone-500 font-normal' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-500 mt-1">
                        {task.timeSlot && (
                          <span className="inline-flex items-center gap-1 font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 border border-stone-200">
                            <Clock className="w-3 h-3 text-stone-500" />
                            <span>{task.timeSlot}</span>
                          </span>
                        )}

                        <span className={`px-1.5 py-0.5 border text-[10px] ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>

                        <span className="text-[10px] text-stone-600 font-mono">
                          {task.category}
                        </span>

                        {task.completed && task.completedAt && (
                          <span className="text-[10px] text-emerald-700 font-medium">
                            {isHindi ? `सम्पन्न: ${task.completedAt}` : `Done at ${task.completedAt}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Delete button (per requirement: completed task can be deleted) */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    <button
                      type="button"
                      onClick={() => deleteDailyTask(task.id)}
                      className="p-1.5 text-stone-300 hover:text-red-700 transition-colors"
                      title={isHindi ? 'कार्य हटाएं' : 'Delete task'}
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className="flex items-center justify-between text-[11px] text-stone-500 pt-2 border-t border-stone-100">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {isHindi
              ? 'दैनिक रिफ्रेश: हर आधी रात को सम्पन्न कार्य स्वतः साफ़ हो जाते हैं।'
              : 'Daily Auto-Refresh: Completed tasks are cleared each calendar day.'}
          </span>
        </span>

        {completedCount > 0 && (
          <button
            type="button"
            onClick={deleteCompletedDailyTasks}
            className="text-red-700 hover:text-red-900 font-semibold underline"
          >
            {isHindi ? 'सम्पन्न कार्य अभी हटाएं' : 'Delete Completed Tasks Now'}
          </button>
        )}
      </div>
    </div>
  );
};
