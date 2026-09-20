import React from 'react';
import { TaskWithAnalysis, AuthUser } from '../types';
import { fmtMin, DAYS_TH, formatDate, LEVELS } from '../utils/planner';
import {
  Sun,
  Moon,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Users,
  Sparkles,
  Palette,
  HelpCircle,
  User as UserIcon,
} from 'lucide-react';

interface HomeScreenProps {
  activeTasks: TaskWithAnalysis[];
  finishedTasks: TaskWithAnalysis[];
  totalTodayMin: number;
  onGoPlanner: () => void;
  onGoChat: () => void;
  onOpenAddModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenThemeSettings?: () => void;
  onOpenGuide?: () => void;
  currentUser?: AuthUser | null;
  onGoAuth?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  activeTasks,
  finishedTasks,
  totalTodayMin,
  onGoPlanner,
  onGoChat,
  onOpenAddModal,
  isDark,
  onToggleTheme,
  onOpenThemeSettings,
  onOpenGuide,
  currentUser,
  onGoAuth,
}) => {
  const now = new Date();
  const h = now.getHours();

  const greeting =
    h >= 5 && h < 12
      ? 'สวัสดีตอนเช้า'
      : h >= 12 && h < 17
      ? 'สวัสดีตอนบ่าย'
      : h >= 17 && h < 21
      ? 'สวัสดีตอนเย็น'
      : 'ดึกแล้ว พักผ่อนบ้างนะ';

  const dateString = `วัน${DAYS_TH[now.getDay()]}ที่ ${formatDate(now.getTime())}`;
  const urgentCount = activeTasks.filter(
    (x) => x.analysis.level === 'high' || x.analysis.level === 'overdue'
  ).length;

  const topTask = activeTasks.length > 0 ? activeTasks[0] : null;

  return (
    <div id="home" className="w-full flex flex-col">
      {/* Top row with greeting and date & theme toggle */}
      <div className="flex items-center justify-between gap-3 text-sm text-[#65708A] dark:text-[#9AA7C4] mb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
          <span id="hello" className="font-medium text-[#15203B] dark:text-white">
            {greeting}
          </span>
          <span className="hidden sm:inline">•</span>
          <span id="dateNow">{dateString}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              aria-label="คู่มือการใช้งาน & ยินยอม"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition shadow-xs"
              title="คำแนะนำการใช้งาน"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {onOpenThemeSettings && (
            <button
              type="button"
              onClick={onOpenThemeSettings}
              aria-label="ตั้งค่าสีพื้นหลังและลวดลาย"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition shadow-xs"
              title="เปลี่ยนสีธีม & ลวดลายพื้นหลัง"
            >
              <Palette className="w-4 h-4 text-purple-500" />
            </button>
          )}

          <button
            id="btn-theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label="สลับโหมดมืด/สว่าง"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-[#E8EDF8] hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition shadow-xs"
            title={isDark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {onGoAuth && (
            <button
              type="button"
              onClick={onGoAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-xs font-semibold text-[#15203B] dark:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition shadow-xs cursor-pointer ml-1"
              title={currentUser ? `บัญชี: ${currentUser.username}` : 'เข้าสู่ระบบ / สมัครสมาชิก'}
            >
              {currentUser ? (
                <>
                  <span className="text-sm leading-none">{currentUser.avatar || '🎓'}</span>
                  <span className="hidden sm:inline max-w-[80px] truncate">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <UserIcon className="w-4 h-4 text-[#1F9D8B]" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Brand Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="brand text-4xl sm:text-5xl font-extrabold tracking-tight text-[#15203B] dark:text-white">
            Jommarn
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1F9D8B]/10 dark:bg-[#1F9D8B]/20 text-[#1F9D8B] border border-[#1F9D8B]/30">
            วางแผนส่งงาน
          </span>
        </div>
        <p className="tag text-base text-[#65708A] dark:text-[#9AA7C4] mt-1.5 font-normal">
          เริ่มทีละนิด ส่งงานทันทุกวิชา
        </p>
      </div>

      {/* Main Highlight Card */}
      <div id="homeToday" className="mb-4">
        {topTask ? (
          <div className="today-card bg-[#15203B] dark:bg-[#1F2C4D] text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#1F9D8B]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="k text-xs sm:text-sm font-medium tracking-wide uppercase text-[#9FB0D6] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#1F9D8B]" />
              เป้าหมายวันนี้
            </div>

            <div className="big text-3xl sm:text-4xl font-bold my-2 tracking-tight">
              {totalTodayMin > 0 ? fmtMin(totalTodayMin) : 'ครบตามแผนแล้ว'}
            </div>

            <div className="sm text-sm text-[#C4D0EA]">
              จากงานที่ค้างอยู่ทั้งหมด {activeTasks.length} ชิ้น
            </div>

            <div className="next mt-5 pt-4 border-t border-[#2C3A5E]/80">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-[#9FB0D6] mb-1">เริ่มจากวิชานี้ก่อน:</div>
                  <div className="n1 font-semibold text-base sm:text-lg text-white truncate">
                    {topTask.task.subject}
                    {topTask.task.title ? ` — ${topTask.task.title}` : ''}
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0"
                  style={{
                    backgroundColor: `${LEVELS[topTask.analysis.level].color}25`,
                    color: '#FFF',
                    border: `1px solid ${LEVELS[topTask.analysis.level].color}60`,
                  }}
                >
                  {LEVELS[topTask.analysis.level].label}
                </span>
              </div>

              <p className="n2 text-xs sm:text-sm text-[#C4D0EA] mt-2.5 leading-relaxed">
                💡 {LEVELS[topTask.analysis.level].nudge}
              </p>
            </div>
          </div>
        ) : (
          <div className="today-card bg-[#15203B] dark:bg-[#1F2C4D] text-white rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="k text-xs sm:text-sm font-medium tracking-wide uppercase text-[#9FB0D6]">
              วันนี้
            </div>
            <div className="big text-3xl sm:text-4xl font-bold my-2 tracking-tight">
              ไม่มีงานค้าง 🎉
            </div>
            <div className="sm text-sm text-[#C4D0EA]">
              เพิ่มงานชิ้นแรก แล้ว Jommarn จะช่วยวางแผนให้ว่าวันนี้ควรทำอะไรก่อนและทำนานแค่ไหน
            </div>
          </div>
        )}
      </div>

      {/* 3 Stats Overview */}
      <div id="stats" className="stats grid grid-cols-3 gap-2.5 sm:gap-3 mb-6">
        <div className="stat bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-2xl sm:text-3xl font-bold block text-[#15203B] dark:text-white">
            {activeTasks.length}
          </span>
          <span className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-0.5 block">
            งานค้าง
          </span>
        </div>

        <div className="stat bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span
            className="text-2xl sm:text-3xl font-bold block"
            style={{ color: urgentCount > 0 ? '#E5484D' : 'inherit' }}
          >
            {urgentCount}
          </span>
          <span className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-0.5 block flex items-center gap-1">
            {urgentCount > 0 && <AlertCircle className="w-3 h-3 text-[#E5484D]" />}
            เร่งด่วน
          </span>
        </div>

        <div className="stat bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <span className="text-2xl sm:text-3xl font-bold block text-[#1F9D8B]">
            {finishedTasks.length}
          </span>
          <span className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-0.5 block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#1F9D8B]" />
            เสร็จแล้ว
          </span>
        </div>
      </div>

      {/* Community Chat Card */}
      <div className="mb-4 bg-linear-to-r from-emerald-500/10 via-[#1F9D8B]/10 to-blue-500/10 dark:from-emerald-950/30 dark:via-[#1F9D8B]/20 dark:to-blue-950/30 border border-[#1F9D8B]/30 rounded-3xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F9D8B]">
                ห้องคุยเพื่อนเรียน (เรียลไทม์)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#15203B] dark:text-white">
              คุยแลกเปลี่ยน & ห้องแชทส่วนตัว
            </h3>
            <p className="text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4] mt-1 leading-relaxed">
              คุยในห้องสาธารณะ หรือสร้างห้องส่วนตัวด้วยรหัสลับ และแชทเดี่ยว 1:1 กับเพื่อนได้สดๆ
            </p>
          </div>

          <button
            type="button"
            onClick={onGoChat}
            className="shrink-0 flex items-center gap-1.5 bg-[#1F9D8B] hover:bg-[#1F9D8B]/90 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>เข้าห้องแชท</span>
          </button>
        </div>
      </div>

      {/* Primary Navigation Actions */}
      <div className="home-acts grid gap-3">
        <button
          id="goList"
          type="button"
          onClick={onGoPlanner}
          className="btn-main w-full flex items-center justify-center gap-2 bg-[#15203B] dark:bg-[#E8EDF8] text-white dark:text-[#0E1424] rounded-2xl py-4 px-6 text-base sm:text-lg font-semibold shadow-md hover:opacity-95 transition"
        >
          <span>ดูงานทั้งหมด</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          id="homeAdd"
          type="button"
          onClick={onOpenAddModal}
          className="btn-alt w-full flex items-center justify-center gap-2 bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#15203B] dark:text-[#E8EDF8] rounded-2xl py-3.5 px-6 text-base font-semibold hover:bg-slate-50 dark:hover:bg-[#1F2C4D] transition shadow-xs"
        >
          <PlusCircle className="w-5 h-5 text-[#1F9D8B]" />
          <span>เพิ่มงานใหม่</span>
        </button>
      </div>
    </div>
  );
};
