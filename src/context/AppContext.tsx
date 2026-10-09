import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  Bookmark,
  Reminder,
  HistoryItem,
  AppSettings,
  DailyPlannerTask,
} from '../types';

interface ExternalActionRequest {
  title: string;
  description: string;
  actionLabel: string;
  target?: string;
  onConfirm: () => void;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (title: string) => boolean;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  dailyTasks: DailyPlannerTask[];
  addDailyTask: (task: Omit<DailyPlannerTask, 'id' | 'dateAssigned' | 'completed'> & { dateAssigned?: string }) => void;
  toggleDailyTask: (id: string) => void;
  deleteDailyTask: (id: string) => void;
  deleteCompletedDailyTasks: () => void;
  refreshDailyTasksForNewDay: () => void;
  todayDateStr: string;
  history: HistoryItem[];
  addHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  requestExternalAction: (request: ExternalActionRequest) => void;
  activeExternalModal: ExternalActionRequest | null;
  closeExternalModal: () => void;
}

const defaultSettings: AppSettings = {
  language: 'en',
  prioritizeHP: true,
  prioritizeRajasthan: true,
  customNewsTopics: ['Renewable Energy in Rajasthan', 'Shimla Tourism & Weather', 'Healthcare Infrastructure'],
  customMedicalTopics: ['Hypertension', 'Fatty Liver Disease (NAFLD)', 'Neurology'],
  trustedSources: ['PubMed', 'ICMR', 'WHO', 'The Hindu', 'Amar Ujala', 'Dainik Bhaskar', 'Official State Health Dept'],
  requireApprovalForExternalActions: true,
  enableAudioNarration: true,
};

const defaultReminders: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Check SMS Medical College Jaipur OPD registration schedule',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'High',
    completed: false,
    category: 'Medical',
  },
  {
    id: 'rem-2',
    title: 'Review weekly blood glucose readings & ICMR guidelines',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    priority: 'Medium',
    completed: false,
    category: 'Medical',
  },
  {
    id: 'rem-3',
    title: 'Read Himachal Pradesh weather & transport advisory',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Low',
    completed: true,
    category: 'News',
  },
];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const defaultDailyTasks: DailyPlannerTask[] = [
  {
    id: 'dt-1',
    title: 'Morning blood glucose check & medicine schedule',
    timeSlot: '08:00 AM',
    priority: 'Urgent',
    category: 'Health',
    completed: false,
    dateAssigned: getTodayDateStr(),
  },
  {
    id: 'dt-2',
    title: 'Review SMS Jaipur / IGMC Shimla online OPD updates',
    timeSlot: '11:00 AM',
    priority: 'High',
    category: 'Health',
    completed: false,
    dateAssigned: getTodayDateStr(),
  },
  {
    id: 'dt-3',
    title: 'Inspect home plumbing & geyser water scaling filter',
    timeSlot: '04:30 PM',
    priority: 'Normal',
    category: 'Household',
    completed: false,
    dateAssigned: getTodayDateStr(),
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const todayDateStr = getTodayDateStr();

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('aidoctor_lang') as Language) || 'en';
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('aidoctor_settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const saved = localStorage.getItem('aidoctor_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [reminders, setReminders] = useState<Reminder[]>(() => {
    try {
      const saved = localStorage.getItem('aidoctor_reminders');
      return saved ? JSON.parse(saved) : defaultReminders;
    } catch {
      return defaultReminders;
    }
  });

  // Daily Planner / To-Do List state with daily refresh logic
  const [dailyTasks, setDailyTasks] = useState<DailyPlannerTask[]>(() => {
    try {
      const saved = localStorage.getItem('aiyadav_daily_tasks');
      const lastDate = localStorage.getItem('aiyadav_last_daily_date');
      const today = getTodayDateStr();

      if (saved) {
        const parsed: DailyPlannerTask[] = JSON.parse(saved);
        // If calendar date has rolled over, refresh for today:
        // Delete all completed tasks from prior days, roll forward pending tasks to today
        if (lastDate && lastDate !== today) {
          const pendingRolledOver = parsed
            .filter(t => !t.completed)
            .map(t => ({ ...t, dateAssigned: today }));
          localStorage.setItem('aiyadav_last_daily_date', today);
          return pendingRolledOver.length > 0 ? pendingRolledOver : defaultDailyTasks;
        }
        return parsed;
      }
      localStorage.setItem('aiyadav_last_daily_date', today);
      return defaultDailyTasks;
    } catch {
      return defaultDailyTasks;
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('aidoctor_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeExternalModal, setActiveExternalModal] = useState<ExternalActionRequest | null>(null);

  // Daily refresh check on mount and interval
  useEffect(() => {
    const today = getTodayDateStr();
    const lastDate = localStorage.getItem('aiyadav_last_daily_date');
    if (lastDate && lastDate !== today) {
      setDailyTasks(prev => {
        const activeRolled = prev.filter(t => !t.completed).map(t => ({ ...t, dateAssigned: today }));
        return activeRolled.length > 0 ? activeRolled : defaultDailyTasks;
      });
      localStorage.setItem('aiyadav_last_daily_date', today);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('aiyadav_daily_tasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('aidoctor_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('aidoctor_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('aidoctor_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('aidoctor_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('aidoctor_history', JSON.stringify(history));
  }, [history]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setSettings(prev => ({ ...prev, language: lang }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addBookmark = (item: Omit<Bookmark, 'id' | 'dateAdded'>) => {
    const newBookmark: Bookmark = {
      ...item,
      id: 'bm-' + Date.now(),
      dateAdded: new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
    setBookmarks(prev => [newBookmark, ...prev]);
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (title: string) => {
    return bookmarks.some(b => b.title.trim().toLowerCase() === title.trim().toLowerCase());
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newRem: Reminder = {
      ...reminder,
      id: 'rem-' + Date.now(),
    };
    setReminders(prev => [newRem, ...prev]);
  };

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const addHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: 'hist-' + Date.now(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHistory(prev => [newItem, ...prev.slice(0, 49)]); // keep last 50
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('aidoctor_history');
  };

  const requestExternalAction = (request: ExternalActionRequest) => {
    if (!settings.requireApprovalForExternalActions) {
      request.onConfirm();
      return;
    }
    setActiveExternalModal(request);
  };

  const closeExternalModal = () => {
    setActiveExternalModal(null);
  };

  const addDailyTask = (task: Omit<DailyPlannerTask, 'id' | 'dateAssigned' | 'completed'> & { dateAssigned?: string }) => {
    const newTask: DailyPlannerTask = {
      ...task,
      id: 'dt-' + Date.now(),
      dateAssigned: task.dateAssigned || getTodayDateStr(),
      completed: false,
    };
    setDailyTasks(prev => [newTask, ...prev]);
  };

  const toggleDailyTask = (id: string) => {
    setDailyTasks(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed
                ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : undefined,
            }
          : t
      )
    );
  };

  const deleteDailyTask = (id: string) => {
    setDailyTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteCompletedDailyTasks = () => {
    setDailyTasks(prev => prev.filter(t => !t.completed));
  };

  const refreshDailyTasksForNewDay = () => {
    const today = getTodayDateStr();
    setDailyTasks(prev => {
      // Delete completed tasks, roll forward pending tasks to today
      return prev.filter(t => !t.completed).map(t => ({ ...t, dateAssigned: today }));
    });
    localStorage.setItem('aiyadav_last_daily_date', today);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        reminders,
        addReminder,
        toggleReminder,
        deleteReminder,
        dailyTasks,
        addDailyTask,
        toggleDailyTask,
        deleteDailyTask,
        deleteCompletedDailyTasks,
        refreshDailyTasksForNewDay,
        todayDateStr,
        history,
        addHistory,
        clearHistory,
        settings,
        updateSettings,
        requestExternalAction,
        activeExternalModal,
        closeExternalModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
