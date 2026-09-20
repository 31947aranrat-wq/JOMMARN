import React, { useState } from 'react';
import { AuthUser, TaskWithAnalysis } from '../types';
import {
  loginAccount,
  registerAccount,
  socialLoginAccount,
  logoutAccount,
  getRegisteredAccounts,
} from '../utils/authStorage';
import {
  ChevronLeft,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AuthScreenProps {
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
  onGoBack: () => void;
  activeTasks?: TaskWithAnalysis[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onGoBack,
  activeTasks = [],
}) => {
  // Mode: 'login' | 'signup' | 'profile'
  const [mode, setMode] = useState<'login' | 'signup' | 'profile'>(() => {
    return currentUser ? 'profile' : 'login';
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign up form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupUsername, setSignupUsername] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Feedback state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Quick fill sample account
  const handleQuickFillDemo = () => {
    const demo = getRegisteredAccounts()[0];
    if (demo) {
      setLoginUsername(demo.username);
      setLoginPassword(demo.password || 'password123');
      setErrorMsg(null);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!loginUsername.trim()) {
      setErrorMsg('กรุณาระบุ USERNAME หรืออีเมล');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = loginAccount({
        username: loginUsername,
        password: loginPassword,
      });

      setLoading(false);
      if (res.success && res.user) {
        setSuccessMsg(`ยินดีต้อนรับกลับ, ${res.user.username}!`);
        onLoginSuccess(res.user);
        setTimeout(() => {
          setMode('profile');
          setSuccessMsg(null);
        }, 600);
      } else {
        setErrorMsg(res.error || 'เข้าสู่ระบบไม่สำเร็จ');
      }
    }, 350);
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!signupEmail.trim()) {
      setErrorMsg('กรุณากรอก E-MAIL');
      return;
    }
    if (!signupUsername.trim()) {
      setErrorMsg('กรุณากรอก USERNAME');
      return;
    }
    if (signupPassword && signupPassword !== signupConfirmPassword) {
      setErrorMsg('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน (CONFIRM PASSWORD)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = registerAccount({
        email: signupEmail,
        phoneNumber: signupPhone,
        username: signupUsername,
        password: signupPassword,
      });

      setLoading(false);
      if (res.success && res.user) {
        setSuccessMsg(`สร้างบัญชีผู้ใช้ ${res.user.username} สำเร็จเรียบร้อย!`);
        onLoginSuccess(res.user);
        setTimeout(() => {
          setMode('profile');
          setSuccessMsg(null);
        }, 700);
      } else {
        setErrorMsg(res.error || 'สร้างบัญชีไม่สำเร็จ');
      }
    }, 400);
  };

  // Handle Social Login
  const handleSocialLogin = (provider: 'google' | 'facebook' | 'email') => {
    setErrorMsg(null);
    setLoading(true);

    setTimeout(() => {
      const user = socialLoginAccount(provider);
      setLoading(false);
      setSuccessMsg(`เข้าสู่ระบบด้วย ${provider.toUpperCase()} สำเร็จ!`);
      onLoginSuccess(user);
      setTimeout(() => {
        setMode('profile');
        setSuccessMsg(null);
      }, 600);
    }, 300);
  };

  // Handle Logout
  const handleLogoutAction = () => {
    logoutAccount();
    onLogout();
    setMode('login');
    setSuccessMsg('ออกจากระบบเรียบร้อยแล้ว');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100vh-5rem)] flex flex-col pb-12">
      {/* Top Bar matching Wireframe: Back arrow on left, LOGO in center */}
      <header className="relative flex items-center justify-between py-4 px-2 mb-2">
        <button
          type="button"
          onClick={onGoBack}
          aria-label="ย้อนกลับ"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition shadow-2xs cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* JOMMARN Center Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#1F9D8B] to-[#3B82F6] flex items-center justify-center text-white shadow-2xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg tracking-wider text-[#15203B] dark:text-white uppercase">
            JOMMARN
          </span>
        </div>

        {/* Right placeholder to keep logo perfectly centered */}
        <div className="w-10 h-10" />
      </header>

      {/* Notifications / Alerts */}
      {errorMsg && (
        <div className="mb-4 mx-2 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 mx-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* VIEW 1: PROFILE VIEW (If currently logged in) */}
      {mode === 'profile' && currentUser && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 text-center">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-slate-100 to-slate-200 dark:from-[#1E2A4A] dark:to-[#15203B] border-4 border-white dark:border-[#2A3555] shadow-md flex items-center justify-center text-4xl">
              {currentUser.avatar || '🎓'}
            </div>
            <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#15203B] flex items-center justify-center text-[10px] text-white">
              ✓
            </span>
          </div>

          <h2 className="text-xl font-bold text-[#15203B] dark:text-white mb-1">
            {currentUser.username}
          </h2>
          <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mb-4">
            {currentUser.email || 'บัญชีผู้เรียน Remix Jommarn'}
          </p>

          {/* User Account Card */}
          <div className="w-full bg-white dark:bg-[#15203B] rounded-3xl border border-[#DDE3EE] dark:border-[#2A3555] p-5 shadow-xs mb-6 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243050]">
              <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">ประเภทบัญชี</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {currentUser.loginProvider ? currentUser.loginProvider.toUpperCase() : 'STANDARD'}
              </span>
            </div>

            {currentUser.phoneNumber && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243050]">
                <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">เบอร์โทรศัพท์</span>
                <span className="text-xs font-medium text-[#15203B] dark:text-white">
                  {currentUser.phoneNumber}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">งานที่กำลังวางแผน</span>
              <span className="text-xs font-bold text-[#1F9D8B]">
                {activeTasks.length} รายการ
              </span>
            </div>
          </div>

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={onGoBack}
              className="w-full h-12 rounded-full bg-[#1F9D8B] hover:bg-[#198475] text-white font-bold text-sm tracking-wider uppercase transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ไปที่หน้าหลัก</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full h-12 rounded-full bg-slate-100 dark:bg-[#1E2A4A] hover:bg-slate-200 dark:hover:bg-[#25345C] text-[#15203B] dark:text-white font-semibold text-xs tracking-wider uppercase transition cursor-pointer"
            >
              สลับบัญชีผู้ใช้
            </button>

            <button
              type="button"
              onClick={handleLogoutAction}
              className="w-full py-2 text-xs font-medium text-red-500 hover:text-red-600 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: LOGIN VIEW (Exact Wireframe IMG_0565.jpeg) */}
      {mode === 'login' && (
        <div className="flex-1 flex flex-col justify-between px-3">
          <div>
            {/* Center Profile Silhouette Icon from Wireframe */}
            <div className="flex flex-col items-center mt-2 mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] border-2 border-[#CBD5E1] dark:border-[#2A3555] flex items-center justify-center text-[#15203B] dark:text-slate-200 shadow-inner mb-3 transition-transform hover:scale-105">
                {/* Silhouette User SVG as in wireframe: circular head + shoulder torso */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-14 h-14 sm:w-16 sm:h-16 fill-[#15203B] dark:fill-slate-100"
                >
                  <circle cx="50" cy="35" r="18" />
                  <path d="M22 82 C22 62, 35 55, 50 55 C65 55, 78 62, 78 82 Z" />
                </svg>
              </div>

              {/* WELCOME BACK Heading */}
              <h1 className="text-xl sm:text-2xl font-serif tracking-wider text-[#15203B] dark:text-white font-bold uppercase text-center">
                WELCOME BACK
              </h1>
              <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-1 text-center">
                เข้าสู่ระบบเพื่อบันทึกงานและการสนทนากลุ่ม
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              {/* Field 1: USERNAME */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  USERNAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="ระบุชื่อผู้ใช้ หรือ อีเมล"
                    autoComplete="username"
                    className="w-full h-12 sm:h-13 px-5 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                  />
                </div>
              </div>

              {/* Field 2: PASSWORD (with eye icon as in wireframe) */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="ระบุรหัสผ่าน"
                    autoComplete="current-password"
                    className="w-full h-12 sm:h-13 pl-5 pr-12 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    aria-label={showLoginPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition cursor-pointer p-1"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Demo Account quick fill helper */}
              <div className="flex justify-between items-center px-4 pt-0.5">
                <button
                  type="button"
                  onClick={handleQuickFillDemo}
                  className="text-[11px] text-[#1F9D8B] hover:underline cursor-pointer font-medium"
                >
                  ⚡ กรอกบัญชีตัวอย่าง (ทดลองใช้)
                </button>
              </div>

              {/* LOGIN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-[#94A3B8] hover:bg-[#64748B] dark:bg-[#1F9D8B] dark:hover:bg-[#198475] text-white text-sm sm:text-base font-bold tracking-wider uppercase transition shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer flex items-center justify-center mt-3"
              >
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'LOGIN'}
              </button>
            </form>

            {/* DON'T HAVE AN ACCOUNT? REGISTER */}
            <div className="text-center mt-5">
              <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                DON'T HAVE AN ACCOUNT?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('signup');
                }}
                className="text-xs font-bold text-[#15203B] dark:text-white hover:text-[#1F9D8B] dark:hover:text-[#1F9D8B] tracking-wide underline cursor-pointer transition uppercase"
              >
                REGISTER
              </button>
            </div>

            {/* OR / CONTINUE WITH */}
            <div className="mt-5 text-center">
              <div className="text-[11px] font-semibold text-[#65708A] dark:text-[#9AA7C4] uppercase tracking-widest mb-1">
                OR
              </div>
              <div className="text-[11px] font-medium text-[#65708A] dark:text-[#9AA7C4] uppercase tracking-wider mb-3">
                CONTINUE WITH
              </div>

              {/* Social Login Icons from Wireframe: Google (G), Facebook (f), Email */}
              <div className="flex items-center justify-center gap-5">
                {/* Google Icon */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  aria-label="เข้าสู่ระบบด้วย Google"
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#1C2640] border border-[#CBD5E1] dark:border-[#2A3555] shadow-xs flex items-center justify-center text-[#15203B] dark:text-white hover:scale-110 active:scale-95 transition cursor-pointer"
                  title="เข้าสู่ระบบด้วย Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.665-5.17 3.665-9.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.1C3.28 21.43 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.1z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.28 2.57 1.25 6.58l4.03 3.1c.95-2.83 3.6-4.93 6.72-4.93z"
                    />
                  </svg>
                </button>

                {/* Facebook Icon */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('facebook')}
                  aria-label="เข้าสู่ระบบด้วย Facebook"
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#1C2640] border border-[#CBD5E1] dark:border-[#2A3555] shadow-xs flex items-center justify-center text-[#1877F2] hover:scale-110 active:scale-95 transition cursor-pointer"
                  title="เข้าสู่ระบบด้วย Facebook"
                >
                  <svg className="w-5 h-5 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* Email / Mail Icon */}
                <button
                  type="button"
                  onClick={() => handleSocialLogin('email')}
                  aria-label="เข้าสู่ระบบด้วย Email"
                  className="w-11 h-11 rounded-full bg-white dark:bg-[#1C2640] border border-[#CBD5E1] dark:border-[#2A3555] shadow-xs flex items-center justify-center text-[#15203B] dark:text-slate-100 hover:scale-110 active:scale-95 transition cursor-pointer"
                  title="เข้าสู่ระบบด้วย Email ด่วน"
                >
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: SIGN UP VIEW (Exact Wireframe IMG_0564.jpeg) */}
      {mode === 'signup' && (
        <div className="flex-1 flex flex-col justify-between px-3">
          <div>
            {/* SIGN UP Heading */}
            <div className="text-center mt-2 mb-5">
              <h1 className="text-xl sm:text-2xl font-serif tracking-wider text-[#15203B] dark:text-white font-bold uppercase">
                SIGN UP
              </h1>
              <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-1">
                สร้างบัญชีใหม่เพื่อเริ่มวางแผนงานและแชทกับเพื่อน
              </p>
            </div>

            {/* Sign Up Form (E-MAIL, PHONE NUMBER, USERNAME, PASSWORD, CONFIRM PASSWORD, CONFIRM button) */}
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5 max-w-sm mx-auto w-full">
              {/* Field 1: E-MAIL */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  E-MAIL
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="student@example.com"
                  autoComplete="email"
                  className="w-full h-11 sm:h-12 px-5 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                />
              </div>

              {/* Field 2: PHONE NUMBER */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  PHONE NUMBER
                </label>
                <input
                  type="tel"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="08x-xxx-xxxx"
                  autoComplete="tel"
                  className="w-full h-11 sm:h-12 px-5 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                />
              </div>

              {/* Field 3: USERNAME */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  USERNAME
                </label>
                <input
                  type="text"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                  autoComplete="username"
                  className="w-full h-11 sm:h-12 px-5 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                />
              </div>

              {/* Field 4: PASSWORD */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    autoComplete="new-password"
                    className="w-full h-11 sm:h-12 pl-5 pr-12 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    aria-label={showSignupPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition cursor-pointer p-1"
                  >
                    {showSignupPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Field 5: CONFIRM PASSWORD */}
              <div className="space-y-1 text-left">
                <label className="block text-[11px] font-bold tracking-widest text-[#15203B] dark:text-slate-200 uppercase px-4">
                  CONFIRM PASSWORD
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านซ้ำอีกครั้ง"
                    autoComplete="new-password"
                    className="w-full h-11 sm:h-12 pl-5 pr-12 rounded-full bg-[#E2E8F0] dark:bg-[#1C2640] text-[#15203B] dark:text-white placeholder-[#94A3B8] dark:placeholder-[#64748B] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1F9D8B] border border-transparent focus:border-[#1F9D8B] transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition cursor-pointer p-1"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* CONFIRM BUTTON as in Wireframe */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 sm:h-13 rounded-xl sm:rounded-2xl bg-[#94A3B8] hover:bg-[#64748B] dark:bg-[#1F9D8B] dark:hover:bg-[#198475] text-white text-sm sm:text-base font-bold tracking-wider uppercase transition shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer flex items-center justify-center mt-4"
              >
                {loading ? 'กำลังบันทึกข้อมูล...' : 'CONFIRM'}
              </button>
            </form>

            {/* Switch back to Login */}
            <div className="text-center mt-5 mb-3">
              <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                ALREADY HAVE AN ACCOUNT?{' '}
              </span>
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setMode('login');
                }}
                className="text-xs font-bold text-[#15203B] dark:text-white hover:text-[#1F9D8B] dark:hover:text-[#1F9D8B] tracking-wide underline cursor-pointer transition uppercase"
              >
                LOGIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
