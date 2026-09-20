export type PriorityLevel = 'overdue' | 'high' | 'mid' | 'low';

export type TaskCategory = 'class' | 'group' | 'personal';

export interface Task {
  id: string;
  subject: string;
  title: string;
  category?: TaskCategory; // 'class' (งานของห้อง) | 'group' (งานกลุ่มเพื่อน) | 'personal' (งานส่วนตัว)
  credits: number;
  importance: number;
  due: number; // timestamp in ms
  doneMin: number;
  done: boolean;
  createdAt: number;
}

export type ThemeColor = 'default' | 'ocean' | 'lavender' | 'emerald' | 'sunset' | 'rose';
export type BgPattern = 'none' | 'dots' | 'grid' | 'stripes' | 'sparkles';

export interface TaskAnalysis {
  daysLeft: number;
  totalMin: number;
  remaining: number;
  todayMin: number;
  score: number;
  level: PriorityLevel;
  progress: number;
}

export interface TaskWithAnalysis {
  task: Task;
  analysis: TaskAnalysis;
}

export type ViewMode = 'home' | 'planner' | 'chat' | 'auth';

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  phoneNumber?: string;
  avatar?: string;
  color?: string;
  bio?: string;
  createdAt: number;
  loginProvider?: 'password' | 'google' | 'facebook' | 'email';
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderColor: string;
  text: string;
  timestamp: number;
  taskTag?: {
    subject: string;
    title?: string;
  };
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon?: string;
  isPrivate?: boolean;
  roomCode?: string;
  peerUser?: ChatUser;
}
