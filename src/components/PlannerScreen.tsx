import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskWithAnalysis } from '../types';
import {
  fmtMin,
  formatDate,
  daysLeftText,
  LEVELS,
  TASK_CATEGORIES,
} from '../utils/planner';
import {
  ChevronLeft,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  Clock,
  Sparkles,
  MessageSquare,
  Palette,
  HelpCircle,
} from 'lucide-react';

interface PlannerScreenProps {
  activeTasks: TaskWithAnalysis[];
  finishedTasks: TaskWithAnalysis[];
  totalTodayMin: number;
  onGoHome: () => void;
  onGoChat: () => void;
  onOpenAddModal: () => void;
  onEditTask: (task: Task) => void;
  onAddTime: (id: string, minutes: number) => void;
  onToggleDone: (id: string, isDone: boolean) => void;
  onRequestDelete: (task: Task) => void;
  onOpenThemeSettings?: () => void;
  onOpenGuide?: () => void;
}

export const PlannerScreen: React.FC<PlannerScreenProps> = ({
  activeTasks,
  finishedTasks,
  totalTodayMin,
  onGoHome,
  onGoChat,
  onOpenAddModal,
  onEditTask,
  onAddTime,
  onToggleDone,
  onRequestDelete,
  onOpenThemeSettings,
  onOpenGuide,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | 'all'>('all');

  const classCount = useMemo(
    () => activeTasks.filter((x) => (x.task.category || 'class') === 'class').length,
    [activeTasks]
  );
  const groupCount = useMemo(
    () => activeTasks.filter((x) => (x.task.category || 'class') === 'group').length,
    [activeTasks]
  );
  const personalCount = useMemo(
    () => activeTasks.filter((x) => (x.task.category || 'class') === 'personal').length,
    [activeTasks]
  );

  const filteredActiveTasks = useMemo(() => {
    if (selectedCategory === 'all') return activeTasks;
    return activeTasks.filter((x) => (x.task.category || 'class') === selectedCategory);
  }, [activeTasks, selectedCategory]);

  const filteredFinishedTasks = useMemo(() => {
    if (selectedCategory === 'all') return finishedTasks;
    return finishedTasks.filter((x) => (x.task.category || 'class') === selectedCategory);
  }, [finishedTasks, selectedCategory]);
  return (
    <div id="planner" className="w-full flex flex-col pb-24">
      {/* Top navigation row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <button
          id="goHome"
          type="button"
          onClick={onGoHome}
          className="back flex items-center gap-1 text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition text-sm font-medium py-1 w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>หน้าแรก</span>
        </button>

        <div className="flex items-center gap-1.5">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="p-1.5 rounded-xl text-xs font-semibold text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] border border-transparent hover:border-[#DDE3EE] dark:hover:border-[#2A3555] transition"
              title="คู่มือ & คำแนะนำการใช้งาน"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}

          {onOpenThemeSettings && (
            <button
              type="button"
              onClick={onOpenThemeSettings}
              className="p-1.5 rounded-xl text-xs font-semibold text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F2C4D] border border-transparent hover:border-[#DDE3EE] dark:hover:border-[#2A3555] transition"
              title="ปรับแต่งธีม & ลวดลาย"
            >
              <Palette className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onGoChat}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#1F9D8B]/10 hover:bg-[#1F9D8B]/20 text-[#1F9D8B] border border-[#1F9D8B]/30 transition shadow-2xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>คุยกับเพื่อน</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#15203B] dark:text-white">
          งานทั้งหมด
        </h1>
        <div id="summary" className="text-sm text-[#65708A] dark:text-[#9AA7C4] mt-1">
          {activeTasks.length > 0
            ? `งานค้าง ${activeTasks.length} ชิ้น • วันนี้ควรทำรวม ${fmtMin(totalTodayMin)}`
            : 'ไม่มีงานค้าง'}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-2 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] shadow-xs'
              : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
          }`}
        >
          ทั้งหมด ({activeTasks.length})
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('class')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            selectedCategory === 'class'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-blue-700 dark:text-blue-300 hover:border-blue-400'
          }`}
        >
          <span>🏫 งานของห้อง</span>
          <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-[10px]">
            {classCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('group')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            selectedCategory === 'group'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-purple-700 dark:text-purple-300 hover:border-purple-400'
          }`}
        >
          <span>👥 งานกลุ่มเพื่อน</span>
          <span className="px-1.5 py-0.2 rounded-full bg-purple-500/20 text-[10px]">
            {groupCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('personal')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
            selectedCategory === 'personal'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] text-teal-700 dark:text-teal-300 hover:border-teal-400'
          }`}
        >
          <span>👤 งานส่วนตัว</span>
          <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-[10px]">
            {personalCount}
          </span>
        </button>
      </div>

      {/* Empty State */}
      {filteredActiveTasks.length === 0 && (
        <div className="empty bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-2xl p-6 mb-4 shadow-xs text-center sm:text-left">
          <b className="block text-base sm:text-lg font-bold text-[#15203B] dark:text-white mb-2">
            {activeTasks.length === 0
              ? 'ยังไม่มีงานที่ต้องส่ง'
              : 'ไม่มีงานในหมวดหมู่นี้'}
          </b>
          <p className="text-sm text-[#65708A] dark:text-[#9AA7C4] leading-relaxed mb-4">
            {activeTasks.length === 0
              ? 'กดปุ่ม "เพิ่มงาน" ด้านล่าง แล้วกรอกวิชา หมวดหมู่งาน หน่วยกิต ความสำคัญ และวันส่ง ระบบจะคำนวณและบอกให้ทันทีว่าวันนี้ควรเริ่มงานไหนก่อนและทำนานกี่นาที'
              : 'คุณยังไม่มีงานที่อยู่ในหมวดหมู่นี้ สามารถกดเลือกหมวดหมู่อื่น หรือกดปุ่มเพิ่มงานใหม่ได้เลย'}
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 bg-[#15203B] dark:bg-[#E8EDF8] text-white dark:text-[#0E1424] px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานใหม่</span>
          </button>
        </div>
      )}

      {/* Active Tasks List */}
      <div id="list" className="space-y-3.5">
        {filteredActiveTasks.map(({ task: t, analysis: a }, idx) => {
          const lv = LEVELS[a.level];
          const taskCat = TASK_CATEGORIES[t.category || 'class'] || TASK_CATEGORIES.class;
          const metaText = `${t.credits} หน่วยกิต • สำคัญ ${t.importance}/5 • ส่ง ${formatDate(t.due)} (${daysLeftText(a.daysLeft)})`;

          // TOP PRIORITY HERO CARD (idx === 0)
          if (idx === 0) {
            return (
              <section
                key={t.id}
                className="hero bg-[#15203B] dark:bg-[#1F2C4D] text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden"
              >
                {/* Accent flag with Category badge */}
                <div className="flag flex items-center justify-between gap-2 text-xs font-semibold text-[#9FB0D6] mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-[#1F9D8B]" />
                      ทำอันนี้ก่อน • {lv.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-white border border-white/20">
                      {taskCat.emoji} {taskCat.shortLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onEditTask(t)}
                    className="text-[#9FB0D6] hover:text-white flex items-center gap-1 text-xs px-2 py-1 rounded-lg bg-white/10"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>แก้ไข</span>
                  </button>
                </div>

                {/* Subject & Title */}
                <div className="subject text-2xl sm:text-3xl font-bold tracking-tight text-white break-words">
                  {t.subject}
                </div>
                {t.title && (
                  <div className="title text-base text-[#DCE4F5] mt-1 break-words font-medium">
                    {t.title}
                  </div>
                )}

                {/* Metadata */}
                <div className="meta text-xs sm:text-sm text-[#9FB0D6] mt-2 leading-relaxed">
                  {metaText}
                </div>

                {/* Today's target goal */}
                <div className="today text-lg sm:text-xl font-bold mt-4 text-[#1F9D8B] flex items-center gap-1.5">
                  <Clock className="w-5 h-5" />
                  {a.remaining === 0
                    ? 'ทำครบตามแผนแล้ว กดเสร็จแล้วได้เลย 🎉'
                    : `วันนี้ทำ ${fmtMin(a.todayMin)}`}
                </div>

                {/* Encouraging psychological nudge */}
                <div className="nudge text-xs sm:text-sm text-[#C4D0EA] mt-1.5 mb-3 leading-relaxed">
                  💡 {lv.nudge}
                </div>

                {/* Progress bar */}
                <div className="track w-full h-2.5 rounded-full bg-[#2C3A5E] overflow-hidden">
                  <div
                    className="fill h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(a.progress * 100)}%`,
                      backgroundColor: lv.color,
                    }}
                  />
                </div>

                <div className="prog text-xs text-[#9FB0D6] mt-1.5 flex justify-between">
                  <span>ทำไปแล้ว {fmtMin(t.doneMin)}</span>
                  <span>เป้าหมายแนะนำ {fmtMin(a.totalMin)} ({Math.round(a.progress * 100)}%)</span>
                </div>

                {/* Quick actions buttons */}
                <div className="acts flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#2C3A5E]">
                  <button
                    type="button"
                    onClick={() => onAddTime(t.id, 10)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
                  >
                    +10 นาที
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddTime(t.id, 30)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-white/10 transition"
                  >
                    +30 นาที
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleDone(t.id, true)}
                    className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[#1F9D8B] hover:bg-[#1F9D8B]/90 text-white transition flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>เสร็จแล้ว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(t)}
                    className="px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-red-300 hover:text-red-200 hover:bg-red-500/20 transition ml-auto"
                  >
                    ลบ
                  </button>
                </div>
              </section>
            );
          }

          // SUBSEQUENT CARDS
          return (
            <section
              key={t.id}
              className="card flex bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Left colored priority strip */}
              <div
                className="strip w-2 shrink-0"
                style={{ backgroundColor: lv.color }}
              />

              <div className="main flex-1 min-w-0 p-4 sm:p-5">
                <div className="top flex justify-between items-start gap-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${taskCat.badgeBg} ${taskCat.textColor} ${taskCat.borderColor}`}
                    >
                      <span>{taskCat.emoji}</span>
                      <span>{taskCat.shortLabel}</span>
                    </span>
                    <div className="subject text-base sm:text-lg font-bold text-[#15203B] dark:text-white break-words">
                      {t.subject}
                    </div>
                  </div>

                  <span
                    className="level text-xs font-semibold px-2 py-0.5 rounded-md shrink-0"
                    style={{
                      color: lv.color,
                      backgroundColor: `${lv.color}15`,
                      border: `1px solid ${lv.color}30`,
                    }}
                  >
                    {lv.label}
                  </span>
                </div>

                {t.title && (
                  <div className="title text-sm text-[#65708A] dark:text-[#9AA7C4] mt-0.5 break-words font-medium">
                    {t.title}
                  </div>
                )}

                <div className="meta text-xs text-[#65708A] dark:text-[#9AA7C4] mt-1.5">
                  {metaText}
                </div>

                <div className="today text-sm font-semibold text-[#15203B] dark:text-[#E8EDF8] my-2">
                  {a.remaining === 0
                    ? 'ทำครบตามแผนแล้ว 🎉'
                    : `วันนี้ทำ ${fmtMin(a.todayMin)}`}
                </div>

                {/* Progress bar */}
                <div className="track w-full h-1.5 rounded-full bg-[#DDE3EE] dark:bg-[#2A3555] overflow-hidden mb-3">
                  <div
                    className="fill h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round(a.progress * 100)}%`,
                      backgroundColor: lv.color,
                    }}
                  />
                </div>

                {/* Actions */}
                <div className="acts flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onAddTime(t.id, 10)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#1F2C4D] text-[#15203B] dark:text-[#E8EDF8] hover:bg-slate-50 dark:hover:bg-[#25365e] transition"
                  >
                    +10 นาที
                  </button>
                  <button
                    type="button"
                    onClick={() => onAddTime(t.id, 30)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#1F2C4D] text-[#15203B] dark:text-[#E8EDF8] hover:bg-slate-50 dark:hover:bg-[#25365e] transition"
                  >
                    +30 นาที
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleDone(t.id, true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1F9D8B] text-white hover:bg-[#1F9D8B]/90 transition flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>เสร็จแล้ว</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditTask(t)}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white transition"
                    title="แก้ไขงาน"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(t)}
                    className="px-2 py-1.5 rounded-lg text-xs font-medium text-[#65708A] dark:text-[#9AA7C4] hover:text-red-500 transition ml-auto"
                  >
                    ลบ
                  </button>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Completed tasks */}
      {filteredFinishedTasks.length > 0 && (
        <div className="mt-8 pt-4 border-t border-[#DDE3EE] dark:border-[#2A3555]">
          <div className="section text-sm font-bold text-[#65708A] dark:text-[#9AA7C4] mb-3 flex items-center justify-between">
            <span>เสร็จแล้ว ({filteredFinishedTasks.length})</span>
          </div>
          <div className="space-y-2">
            {filteredFinishedTasks.map(({ task: t }) => {
              const catConfig = TASK_CATEGORIES[t.category || 'class'] || TASK_CATEGORIES.class;
              return (
                <div
                  key={t.id}
                  className="done-row flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-[#172038]/60 border border-[#DDE3EE]/60 dark:border-[#2A3555]/60"
                >
                  <span className="text-xs shrink-0" title={catConfig.label}>
                    {catConfig.emoji}
                  </span>
                  <span className="flex-1 min-w-0 text-sm text-[#A3ACBF] dark:text-[#6F7B99] line-through truncate font-medium">
                    {t.subject}
                    {t.title ? ` — ${t.title}` : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleDone(t.id, false)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg text-[#1F9D8B] hover:bg-[#1F9D8B]/10 transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(t)}
                    className="p-1 text-xs text-[#65708A] dark:text-[#9AA7C4] hover:text-red-500 transition"
                    title="ลบ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        id="fab"
        type="button"
        onClick={onOpenAddModal}
        className="fixed right-5 bottom-6 z-40 flex items-center gap-2 bg-[#15203B] dark:bg-[#E8EDF8] text-white dark:text-[#0E1424] rounded-full py-3.5 px-6 font-semibold text-sm sm:text-base shadow-xl hover:scale-105 active:scale-95 transition-all"
      >
        <Plus className="w-5 h-5" />
        <span>เพิ่มงาน</span>
      </button>
    </div>
  );
};
