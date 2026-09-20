import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskWithAnalysis, ViewMode, ThemeColor, BgPattern, AuthUser } from './types';
import {
  loadTasks,
  saveTasks,
  startOfDay,
  analyzeTask,
} from './utils/planner';
import { getAuthUser, saveAuthUser } from './utils/authStorage';
import { HomeScreen } from './components/HomeScreen';
import { PlannerScreen } from './components/PlannerScreen';
import { ChatScreen } from './components/ChatScreen';
import { AuthScreen } from './components/AuthScreen';
import { TaskFormModal } from './components/TaskFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ThemeSettingsModal, THEME_COLORS } from './components/ThemeSettingsModal';
import { ConsentAndGuideModal } from './components/ConsentAndGuideModal';
import { Home, CheckSquare, MessageSquare, Settings, User as UserIcon } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<Task | null>(null);

  // Authentication state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getAuthUser());

  // Theme, color, pattern states
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jommarn-theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [themeColor, setThemeColor] = useState<ThemeColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jommarn-theme-color') as ThemeColor) || 'default';
    }
    return 'default';
  });

  const [bgPattern, setBgPattern] = useState<BgPattern>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('jommarn-bg-pattern') as BgPattern) || 'dots';
    }
    return 'dots';
  });

  // Modals state
  const [isThemeSettingsOpen, setIsThemeSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jommarn-consent-v1') === 'accepted';
    }
    return true;
  });

  // Check URL parameters for direct tab navigation (e.g. ?tab=chat, ?tab=planner, ?tab=auth)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'chat') {
        setViewMode('chat');
      } else if (params.get('tab') === 'planner') {
        setViewMode('planner');
      } else if (params.get('tab') === 'auth' || params.get('tab') === 'login') {
        setViewMode('auth');
      }
    }
  }, []);

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('jommarn-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('jommarn-theme', 'light');
    }
  }, [isDark]);

  // Persist tasks on change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  // Analyze all tasks for today
  const { activeTasks, finishedTasks, totalTodayMin } = useMemo(() => {
    const today = startOfDay(Date.now());
    const analyzed: TaskWithAnalysis[] = tasks.map((t) => ({
      task: t,
      analysis: analyzeTask(t, today),
    }));

    const active = analyzed
      .filter((x) => !x.task.done)
      .sort((a, b) => b.analysis.score - a.analysis.score);

    const finished = analyzed.filter((x) => x.task.done);

    const total = active.reduce((acc, curr) => acc + curr.analysis.todayMin, 0);

    return {
      activeTasks: active,
      finishedTasks: finished,
      totalTodayMin: total,
    };
  }, [tasks]);

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                ...taskData,
              }
            : t
        )
      );
      setEditingTask(null);
    } else {
      // Add new task
      const newTask: Task = {
        ...taskData,
        id: String(Date.now()),
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
  };

  const handleAddTime = (id: string, minutes: number) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, doneMin: t.doneMin + minutes } : t))
    );
  };

  const handleToggleDone = (id: string, isDone: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: isDone } : t))
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTaskTarget) return;
    setTasks((prev) => prev.filter((t) => t.id !== deleteTaskTarget.id));
    setDeleteTaskTarget(null);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAcceptConsent = () => {
    localStorage.setItem('jommarn-consent-v1', 'accepted');
    setHasConsent(true);
    setIsGuideOpen(false);
  };

  const handleChangeThemeColor = (color: ThemeColor) => {
    setThemeColor(color);
    localStorage.setItem('jommarn-theme-color', color);
  };

  const handleChangeBgPattern = (pattern: BgPattern) => {
    setBgPattern(pattern);
    localStorage.setItem('jommarn-bg-pattern', pattern);
  };

  const currentTheme = THEME_COLORS.find((c) => c.id === themeColor) || THEME_COLORS[0];
  const customBg = isDark ? currentTheme.darkBg : currentTheme.lightBg;

  return (
    <div
      className={`min-h-screen text-[#15203B] dark:text-[#E8EDF8] transition-colors duration-200 flex flex-col pattern-${bgPattern}`}
      style={{ backgroundColor: customBg }}
    >
      <main className="max-w-2xl mx-auto w-full px-4 sm:px-6 pt-5 sm:pt-8 pb-24 flex-1">
        {viewMode === 'home' && (
          <HomeScreen
            activeTasks={activeTasks}
            finishedTasks={finishedTasks}
            totalTodayMin={totalTodayMin}
            onGoPlanner={() => {
              setViewMode('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoChat={() => {
              setViewMode('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddModal={handleOpenAddModal}
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            currentUser={authUser}
            onGoAuth={() => {
              setViewMode('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {viewMode === 'planner' && (
          <PlannerScreen
            activeTasks={activeTasks}
            finishedTasks={finishedTasks}
            totalTodayMin={totalTodayMin}
            onGoHome={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoChat={() => {
              setViewMode('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAddModal={handleOpenAddModal}
            onEditTask={handleEditTask}
            onAddTime={handleAddTime}
            onToggleDone={handleToggleDone}
            onRequestDelete={(task) => setDeleteTaskTarget(task)}
            onOpenThemeSettings={() => setIsThemeSettingsOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {viewMode === 'chat' && (
          <ChatScreen
            onGoHome={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onGoPlanner={() => {
              setViewMode('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activeTasks={activeTasks}
          />
        )}

        {viewMode === 'auth' && (
          <AuthScreen
            currentUser={authUser}
            onLoginSuccess={(user) => {
              setAuthUser(user);
            }}
            onLogout={() => {
              setAuthUser(null);
            }}
            onGoBack={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activeTasks={activeTasks}
          />
        )}
      </main>

      {/* Persistent Bottom Navigation Bar (5 Items matching Wireframe) */}
      <nav
        aria-label="เมนูหลัก"
        className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-[#15203B]/95 backdrop-blur-md border-t border-[#DDE3EE] dark:border-[#2A3555] px-2 sm:px-4 py-1.5"
      >
        <div className="max-w-md mx-auto flex items-center justify-between sm:justify-around">
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => {
              setViewMode('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition cursor-pointer ${
              viewMode === 'home'
                ? 'text-[#1F9D8B] font-bold'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px]">หน้าแรก</span>
          </button>

          {/* 2. Planner / Tasks */}
          <button
            type="button"
            onClick={() => {
              setViewMode('planner');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative cursor-pointer ${
              viewMode === 'planner'
                ? 'text-[#1F9D8B] font-bold'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px]">งานทั้งหมด</span>
            {activeTasks.length > 0 && (
              <span className="absolute -top-0.5 right-1.5 w-4 h-4 rounded-full bg-[#1F9D8B] text-white text-[9px] flex items-center justify-center font-bold">
                {activeTasks.length > 9 ? '9+' : activeTasks.length}
              </span>
            )}
          </button>

          {/* 3. Chat */}
          <button
            type="button"
            onClick={() => {
              setViewMode('chat');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative cursor-pointer ${
              viewMode === 'chat'
                ? 'text-[#1F9D8B] font-bold'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px]">ห้องแชท</span>
            {/* Live Indicator Dot */}
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#15203B]" />
          </button>

          {/* 4. Settings (Theme & Pattern) */}
          <button
            type="button"
            onClick={() => setIsThemeSettingsOpen(true)}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white cursor-pointer"
            title="ตั้งค่าธีม & ลวดลาย"
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] sm:text-[11px]">ตั้งค่า</span>
          </button>

          {/* 5. Account / Login (Wireframe User Icon) */}
          <button
            type="button"
            onClick={() => {
              setViewMode('auth');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition relative cursor-pointer ${
              viewMode === 'auth'
                ? 'text-[#1F9D8B] font-bold'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
            title="เข้าสู่ระบบ / บัญชีผู้ใช้"
          >
            <div className="relative">
              <UserIcon className="w-5 h-5" />
              {authUser && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#15203B]" />
              )}
            </div>
            <span className="text-[10px] sm:text-[11px]">
              {authUser ? 'บัญชี' : 'ล็อกอิน'}
            </span>
          </button>
        </div>
      </nav>

      {/* Add / Edit Task Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTaskTarget)}
        taskTitle={deleteTaskTarget ? deleteTaskTarget.subject : ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTaskTarget(null)}
      />

      {/* Theme & Pattern Customization Modal */}
      <ThemeSettingsModal
        isOpen={isThemeSettingsOpen}
        onClose={() => setIsThemeSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={setIsDark}
        themeColor={themeColor}
        onChangeThemeColor={handleChangeThemeColor}
        bgPattern={bgPattern}
        onChangeBgPattern={handleChangeBgPattern}
      />

      {/* User Guide & First-time Consent Modal */}
      <ConsentAndGuideModal
        isOpen={!hasConsent || isGuideOpen}
        isFirstVisit={!hasConsent}
        onAccept={handleAcceptConsent}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
