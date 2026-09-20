import { AuthUser, ChatUser } from '../types';
import { saveChatUser, getOrCreateChatUser } from './chatStorage';

const AUTH_USER_KEY = 'jommarn-auth-user';
const REGISTERED_USERS_KEY = 'jommarn-registered-users';

export interface StoredAccount {
  id: string;
  username: string;
  email: string;
  phoneNumber?: string;
  password?: string;
  avatar: string;
  color: string;
  createdAt: number;
  loginProvider?: 'password' | 'google' | 'facebook' | 'email';
}

const DEFAULT_AVATARS = ['🎓', '🎒', '🌸', '⚡', '📐', '💻', '🎨', '🌟', '📚', '☕'];
const DEFAULT_COLORS = ['#1F9D8B', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(AUTH_USER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading auth user:', e);
  }
  return null;
}

export function saveAuthUser(user: AuthUser | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      // Also sync to chat user
      const chatUser: ChatUser = {
        id: user.id,
        name: user.username,
        avatar: user.avatar || '🎓',
        color: user.color || '#1F9D8B',
      };
      saveChatUser(chatUser);
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (e) {
    console.error('Error saving auth user:', e);
  }
}

export function getRegisteredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(REGISTERED_USERS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading registered accounts:', e);
  }
  // Default sample student account for convenience
  const defaultAccount: StoredAccount = {
    id: 'user-demo-1',
    username: 'นักเรียนตัวอย่าง',
    email: 'student@example.com',
    phoneNumber: '0812345678',
    password: 'password123',
    avatar: '🎓',
    color: '#1F9D8B',
    createdAt: Date.now() - 86400000 * 7,
    loginProvider: 'password',
  };
  saveRegisteredAccounts([defaultAccount]);
  return [defaultAccount];
}

function saveRegisteredAccounts(accounts: StoredAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving registered accounts:', e);
  }
}

export function registerAccount(data: {
  username: string;
  email: string;
  phoneNumber?: string;
  password?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const accounts = getRegisteredAccounts();

  const trimmedUsername = data.username.trim();
  const trimmedEmail = data.email.trim().toLowerCase();

  if (!trimmedUsername) {
    return { success: false, error: 'กรุณากรอก Username' };
  }
  if (!trimmedEmail) {
    return { success: false, error: 'กรุณากรอก Email' };
  }

  // Check duplicate
  const exists = accounts.some(
    (acc) =>
      acc.username.toLowerCase() === trimmedUsername.toLowerCase() ||
      (acc.email && acc.email.toLowerCase() === trimmedEmail)
  );

  if (exists) {
    return { success: false, error: 'Username หรือ Email นี้มีในระบบแล้ว' };
  }

  const randomAvatar = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  const randomColor = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];

  const newAccount: StoredAccount = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    username: trimmedUsername,
    email: trimmedEmail,
    phoneNumber: data.phoneNumber?.trim() || '',
    password: data.password || '',
    avatar: randomAvatar,
    color: randomColor,
    createdAt: Date.now(),
    loginProvider: 'password',
  };

  accounts.push(newAccount);
  saveRegisteredAccounts(accounts);

  const authUser: AuthUser = {
    id: newAccount.id,
    username: newAccount.username,
    email: newAccount.email,
    phoneNumber: newAccount.phoneNumber,
    avatar: newAccount.avatar,
    color: newAccount.color,
    createdAt: newAccount.createdAt,
    loginProvider: 'password',
  };

  saveAuthUser(authUser);
  return { success: true, user: authUser };
}

export function loginAccount(credentials: {
  username: string;
  password?: string;
}): { success: boolean; user?: AuthUser; error?: string } {
  const accounts = getRegisteredAccounts();
  const query = credentials.username.trim().toLowerCase();

  if (!query) {
    return { success: false, error: 'กรุณากรอก Username หรือ Email' };
  }

  const account = accounts.find(
    (acc) =>
      acc.username.toLowerCase() === query ||
      acc.email.toLowerCase() === query
  );

  if (!account) {
    return { success: false, error: 'ไม่พบบัญชีผู้ใช้นี้ กรุณาสมัครสมาชิกก่อน' };
  }

  if (account.password && credentials.password && account.password !== credentials.password) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง' };
  }

  const authUser: AuthUser = {
    id: account.id,
    username: account.username,
    email: account.email,
    phoneNumber: account.phoneNumber,
    avatar: account.avatar,
    color: account.color,
    createdAt: account.createdAt,
    loginProvider: account.loginProvider || 'password',
  };

  saveAuthUser(authUser);
  return { success: true, user: authUser };
}

export function socialLoginAccount(
  provider: 'google' | 'facebook' | 'email',
  customEmail?: string
): AuthUser {
  const providerNames: Record<string, string> = {
    google: 'Google User',
    facebook: 'Facebook User',
    email: 'Email User',
  };

  const defaultEmail = customEmail || `${provider}_${Math.floor(1000 + Math.random() * 9000)}@example.com`;
  const name = `${providerNames[provider]} #${Math.floor(100 + Math.random() * 900)}`;

  const authUser: AuthUser = {
    id: `soc-${provider}-${Date.now().toString(36)}`,
    username: name,
    email: defaultEmail,
    avatar: provider === 'google' ? '🌐' : provider === 'facebook' ? '📘' : '✉️',
    color: provider === 'google' ? '#EA4335' : provider === 'facebook' ? '#1877F2' : '#1F9D8B',
    createdAt: Date.now(),
    loginProvider: provider,
  };

  saveAuthUser(authUser);
  return authUser;
}

export function logoutAccount(): void {
  saveAuthUser(null);
}
