import { ChatUser } from '../types';

const STORAGE_KEY = 'jommarn-chat-user';
const PRIVATE_ROOMS_KEY = 'jommarn-private-rooms';

export const AVATAR_OPTIONS = ['🎓', '🎒', '🌸', '⚡', '📐', '💻', '🎨', '🌟', '📚', '☕', '🔥', '🐱'];
export const COLOR_OPTIONS = [
  '#1F9D8B', // Teal
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#E5484D', // Red
  '#06B6D4', // Cyan
];

const DEFAULT_NAMES = [
  'เด็กเรียนสายชิล',
  'ปั่นงานไฟลุก',
  'เด็กวิทย์คิดบวก',
  'สายศิลป์กินนอน',
  'นักอ่านยามดึก',
  'โปรเจกต์มหาประลัย',
  'สหายการบ้าน',
  'เพื่อนร่วมชั้น',
];

export function getOrCreateChatUser(): ChatUser {
  if (typeof window === 'undefined') {
    return {
      id: 'user-default',
      name: 'เพื่อนร่วมชั้น',
      avatar: '🎓',
      color: '#1F9D8B',
    };
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading chat user:', e);
  }

  const randomName = DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)];
  const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
  const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  const newUser: ChatUser = {
    id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${randomName} #${Math.floor(100 + Math.random() * 900)}`,
    avatar: randomAvatar,
    color: randomColor,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  } catch (e) {
    // Ignore localStorage errors
  }

  return newUser;
}

export function saveChatUser(user: ChatUser): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Error saving chat user:', e);
  }
}

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getDMRoomId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `dm_${sorted[0]}__${sorted[1]}`;
}

export function loadSavedPrivateRooms(): import('../types').ChatRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(PRIVATE_ROOMS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading private rooms:', e);
  }
  return [];
}

export function savePrivateRooms(rooms: import('../types').ChatRoom[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRIVATE_ROOMS_KEY, JSON.stringify(rooms));
  } catch (e) {
    console.error('Error saving private rooms:', e);
  }
}

