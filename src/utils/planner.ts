import { PriorityLevel, Task, TaskAnalysis, TaskCategory } from '../types';

export const STORAGE_KEY = 'deadline-planner-v1';
export const DAY_MS = 86400000;

export const MONTHS_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
export const DAYS_TH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
export const IMPORTANCE_LABELS = ['', 'น้อย', 'ค่อนข้างน้อย', 'ปานกลาง', 'สำคัญ', 'สำคัญมาก'];
export const CREDIT_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];

export interface CategoryConfig {
  key: TaskCategory;
  label: string;
  shortLabel: string;
  emoji: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
}

export const TASK_CATEGORIES: Record<TaskCategory, CategoryConfig> = {
  class: {
    key: 'class',
    label: 'งานของห้อง',
    shortLabel: 'งานห้อง',
    emoji: '🏫',
    badgeBg: 'bg-blue-500/15 dark:bg-blue-500/20',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-500/30',
  },
  group: {
    key: 'group',
    label: 'งานของกลุ่มเพื่อน',
    shortLabel: 'งานกลุ่ม',
    emoji: '👥',
    badgeBg: 'bg-purple-500/15 dark:bg-purple-500/20',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-purple-500/30',
  },
  personal: {
    key: 'personal',
    label: 'งานส่วนตัว / ตัวเราเอง',
    shortLabel: 'งานส่วนตัว',
    emoji: '👤',
    badgeBg: 'bg-teal-500/15 dark:bg-teal-500/20',
    textColor: 'text-teal-700 dark:text-teal-300',
    borderColor: 'border-teal-500/30',
  },
};

export interface LevelConfig {
  color: string;
  label: string;
  nudge: string;
  badgeBg: string;
  textColor: string;
}

export const LEVELS: Record<PriorityLevel, LevelConfig> = {
  overdue: {
    color: '#E5484D',
    label: 'เลยกำหนดแล้ว',
    nudge: 'ยังไม่สายเกินไป เริ่มแค่ 10 นาทีตอนนี้ก็ดีกว่าไม่เริ่ม',
    badgeBg: 'bg-red-500/15 border-red-500/30',
    textColor: 'text-red-600 dark:text-red-400',
  },
  high: {
    color: '#E5484D',
    label: 'เร่งด่วน',
    nudge: 'วันนี้เอางานนี้ก่อนอย่างอื่น เปิดไฟล์แล้วเขียนบรรทัดแรกให้ได้',
    badgeBg: 'bg-red-500/15 border-red-500/30',
    textColor: 'text-red-600 dark:text-red-400',
  },
  mid: {
    color: '#E8971A',
    label: 'เริ่มได้แล้ว',
    nudge: 'ทำวันละนิด งานจะไม่กองมารวมกันตอนใกล้ส่ง',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    textColor: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    color: '#1F9D8B',
    label: 'ยังมีเวลา',
    nudge: 'ยังไม่รีบ แต่ทำสัก 10 นาทีวันนี้ จะเบาขึ้นมากในอีกสองสามวัน',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  },
};

export const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export const addDays = (ts: number, n: number): number => {
  const d = new Date(ts);
  d.setDate(d.getDate() + n);
  return startOfDay(d.getTime());
};

export const formatDate = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
};

export const toISO = (ts: number): string => {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const fromISO = (str: string): number => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
};

export const fmtMin = (m: number): string => {
  if (m <= 0) return '0 นาที';
  if (m < 60) return `${m} นาที`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} ชม. ${r} นาที` : `${h} ชม.`;
};

export const daysLeftText = (d: number): string => {
  if (d < 0) return `เลย ${-d} วัน`;
  if (d === 0) return 'ส่งวันนี้';
  if (d === 1) return 'ส่งพรุ่งนี้';
  return `อีก ${d} วัน`;
};

export const analyzeTask = (t: Task, todayStart: number): TaskAnalysis => {
  const daysLeft = Math.round((startOfDay(t.due) - todayStart) / DAY_MS);
  const weight = t.credits * t.importance; // credits x importance (1-30)
  const totalMin = Math.max(60, weight * 30); // estimated total time
  const remaining = Math.max(0, totalMin - t.doneMin);
  const spread = Math.max(daysLeft, 1); // due date itself is buffer day
  let todayMin = remaining === 0 ? 0 : Math.max(10, Math.ceil(remaining / spread / 5) * 5);
  todayMin = Math.min(todayMin, remaining);

  const score = daysLeft < 0 ? 1000 - daysLeft : weight / Math.max(daysLeft, 0.5);

  let level: PriorityLevel = 'low';
  if (daysLeft < 0) {
    level = 'overdue';
  } else if (daysLeft <= 1 || score >= 6) {
    level = 'high';
  } else if (daysLeft <= 4 || score >= 2.5) {
    level = 'mid';
  }

  return {
    daysLeft,
    totalMin,
    remaining,
    todayMin,
    score,
    level,
    progress: Math.min(1, t.doneMin / totalMin),
  };
};

export const loadTasks = (): Task[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialTasks();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((t: Task) => ({
        ...t,
        category: t.category || 'class',
      }));
    }
    return getInitialTasks();
  } catch {
    return getInitialTasks();
  }
};

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to persist tasks', e);
  }
};

function getInitialTasks(): Task[] {
  const now = Date.now();
  const today = startOfDay(now);
  return [
    {
      id: 'sample-1',
      subject: 'แคลคูลัส 1',
      title: 'แบบฝึกหัดทบทวนบทที่ 3 (อนุพันธ์ย่อย)',
      category: 'class',
      credits: 3,
      importance: 4,
      due: addDays(today, 2),
      doneMin: 20,
      done: false,
      createdAt: now - 86400000,
    },
    {
      id: 'sample-2',
      subject: 'โครงสร้างข้อมูลและอัลกอริทึม',
      title: 'โปรเจกต์เขียนโปรแกรมกราฟ Search',
      category: 'group',
      credits: 2.5,
      importance: 5,
      due: addDays(today, 4),
      doneMin: 40,
      done: false,
      createdAt: now - 172800000,
    },
    {
      id: 'sample-3',
      subject: 'ภาษาอังกฤษเพื่อการสื่อสาร',
      title: 'อ่านบทความ TED Talk สรุปคำศัพท์ 20 คำ',
      category: 'personal',
      credits: 1.5,
      importance: 3,
      due: addDays(today, 6),
      doneMin: 15,
      done: false,
      createdAt: now - 50000000,
    },
  ];
}
