import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Sparkles } from 'lucide-react';
import { Task, TaskCategory } from '../types';
import {
  IMPORTANCE_LABELS,
  TASK_CATEGORIES,
  CREDIT_OPTIONS,
  startOfDay,
  addDays,
  toISO,
  fromISO,
} from '../utils/planner';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt'>) => void;
  initialTask?: Task | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskCategory>('class');
  const [dueStr, setDueStr] = useState('');
  const [credits, setCredits] = useState(1.5);
  const [importance, setImportance] = useState(3);
  const [doneMin, setDoneMin] = useState(0);
  const [error, setError] = useState('');

  const today = startOfDay(Date.now());
  const todayISO = toISO(today);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setSubject(initialTask.subject);
        setTitle(initialTask.title || '');
        setCategory(initialTask.category || 'class');
        setDueStr(toISO(initialTask.due));
        setCredits(initialTask.credits);
        setImportance(initialTask.importance);
        setDoneMin(initialTask.doneMin || 0);
      } else {
        setSubject('');
        setTitle('');
        setCategory('class');
        setDueStr(toISO(addDays(today, 3)));
        setCredits(1.5);
        setImportance(3);
        setDoneMin(0);
      }
      setError('');
    }
  }, [isOpen, initialTask]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQuickDays = (days: number) => {
    setDueStr(toISO(addDays(today, days)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      setError('กรอกชื่อวิชาก่อนบันทึก');
      return;
    }
    if (!dueStr) {
      setError('เลือกวันส่งก่อน');
      return;
    }

    onSave({
      subject: trimmedSubject,
      title: title.trim(),
      category,
      credits,
      importance,
      due: fromISO(dueStr),
      doneMin: doneMin,
      done: initialTask ? initialTask.done : false,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="task-form-sheet"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            id="task-form-panel"
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#F2F5FA] dark:bg-[#0E1424] text-[#15203B] dark:text-[#E8EDF8] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl border-t sm:border border-[#DDE3EE] dark:border-[#2A3555] overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ftitle"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#172038]">
              <div>
                <h2 id="ftitle" className="text-xl font-bold">
                  {initialTask ? 'แก้ไขงาน' : 'เพิ่มงานใหม่'}
                </h2>
                <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-0.5">
                  ระบบจะคำนวณชั่วโมงที่ควรทำวันนี้ตามหน่วยกิตและความสำคัญ
                </p>
              </div>
              <button
                id="btn-close-form"
                type="button"
                onClick={onClose}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              {/* Task Category Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-[#15203B] dark:text-[#E8EDF8]">
                  หมวดหมู่งาน <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['class', 'group', 'personal'] as TaskCategory[]).map((catKey) => {
                    const cfg = TASK_CATEGORIES[catKey];
                    const isSelected = category === catKey;
                    return (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setCategory(catKey)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                          isSelected
                            ? 'bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] border-[#15203B] dark:border-white shadow-xs font-semibold'
                            : 'bg-white dark:bg-[#172038] text-[#15203B] dark:text-[#E8EDF8] border-[#DDE3EE] dark:border-[#2A3555] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                        }`}
                      >
                        <span className="text-lg mb-0.5">{cfg.emoji}</span>
                        <span className="text-xs">{cfg.shortLabel}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#65708A] dark:text-[#9AA7C4] mt-1.5 px-0.5">
                  {category === 'class' && '🏫 งานของห้อง: การบ้าน/งานที่ส่งพร้อมกันทั้งชั้นเรียน'}
                  {category === 'group' && '👥 งานของกลุ่มเพื่อน: งานกลุ่ม/โครงงานทำร่วมกับเพื่อน'}
                  {category === 'personal' && '👤 งานส่วนตัว/ตัวเราเอง: งานเดี่ยวหรือเป้าหมายส่วนตัว'}
                </p>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-semibold mb-2 text-[#15203B] dark:text-[#E8EDF8]"
                >
                  วิชา <span className="text-red-500">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="เช่น แคลคูลัส 1, ฟิสิกส์ทั่วไป, ภาษาอังกฤษ 2"
                  autoComplete="off"
                  className="w-full bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-xl px-3.5 py-2.5 text-base text-[#15203B] dark:text-[#E8EDF8] focus:border-[#1F9D8B] focus:ring-1 focus:ring-[#1F9D8B] outline-none transition placeholder:text-[#65708A]/60 dark:placeholder:text-[#9AA7C4]/60"
                  autoFocus
                />
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold mb-2 text-[#15203B] dark:text-[#E8EDF8]"
                >
                  ชื่องาน <span className="text-xs font-normal text-[#65708A] dark:text-[#9AA7C4]">(ไม่ใส่ก็ได้)</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น รายงานบทที่ 2, แบบฝึกหัดสัปดาห์ที่ 5"
                  autoComplete="off"
                  className="w-full bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-xl px-3.5 py-2.5 text-base text-[#15203B] dark:text-[#E8EDF8] focus:border-[#1F9D8B] focus:ring-1 focus:ring-[#1F9D8B] outline-none transition placeholder:text-[#65708A]/60 dark:placeholder:text-[#9AA7C4]/60"
                />
              </div>

              {/* Due Date */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="due"
                    className="block text-sm font-semibold text-[#15203B] dark:text-[#E8EDF8]"
                  >
                    วันส่ง <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickDays(0)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] hover:border-[#1F9D8B] text-[#65708A] dark:text-[#9AA7C4]"
                    >
                      วันนี้
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDays(1)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] hover:border-[#1F9D8B] text-[#65708A] dark:text-[#9AA7C4]"
                    >
                      พรุ่งนี้
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDays(3)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] hover:border-[#1F9D8B] text-[#65708A] dark:text-[#9AA7C4]"
                    >
                      3 วัน
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDays(7)}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] hover:border-[#1F9D8B] text-[#65708A] dark:text-[#9AA7C4]"
                    >
                      1 สัปดาห์
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    id="due"
                    type="date"
                    min={todayISO}
                    value={dueStr}
                    onChange={(e) => {
                      setDueStr(e.target.value);
                      if (error) setError('');
                    }}
                    className="w-full bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-xl px-3.5 py-2.5 text-base text-[#15203B] dark:text-[#E8EDF8] focus:border-[#1F9D8B] focus:ring-1 focus:ring-[#1F9D8B] outline-none transition"
                  />
                  <Calendar className="w-5 h-5 text-[#65708A] dark:text-[#9AA7C4] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Credits */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-[#15203B] dark:text-[#E8EDF8]">
                    หน่วยกิตของวิชา: <span className="text-[#1F9D8B] font-bold">{credits} หน่วยกิต</span>
                  </div>
                  <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                    มีผลต่อเวลาประเมิน
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5 sm:gap-2" id="credits">
                  {CREDIT_OPTIONS.map((c) => {
                    const isSelected = credits === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCredits(c)}
                        aria-pressed={isSelected}
                        className={`py-2 rounded-xl text-sm sm:text-base font-semibold border transition text-center ${
                          isSelected
                            ? 'bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] border-[#15203B] dark:border-white shadow-sm'
                            : 'bg-white dark:bg-[#172038] text-[#15203B] dark:text-[#E8EDF8] border-[#DDE3EE] dark:border-[#2A3555] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Importance */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-semibold text-[#15203B] dark:text-[#E8EDF8]">
                    ความสำคัญของงาน:{' '}
                    <span className="text-[#1F9D8B] font-bold">
                      {importance}/5 ({IMPORTANCE_LABELS[importance]})
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2" id="importance">
                  {[1, 2, 3, 4, 5].map((lvl) => {
                    const isSelected = importance === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setImportance(lvl)}
                        aria-pressed={isSelected}
                        className={`py-2 rounded-xl text-base font-semibold border transition text-center ${
                          isSelected
                            ? 'bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] border-[#15203B] dark:border-white shadow-sm'
                            : 'bg-white dark:bg-[#172038] text-[#15203B] dark:text-[#E8EDF8] border-[#DDE3EE] dark:border-[#2A3555] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[11px] text-[#65708A] dark:text-[#9AA7C4] mt-1.5 px-1">
                  <span>งานย่อย</span>
                  <span>ปานกลาง</span>
                  <span>โปรเจกต์/สอบ</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div
                  id="err"
                  role="alert"
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium"
                >
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 pb-2 flex gap-3">
                <button
                  id="cancel"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl text-base font-medium border border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#172038] text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-50 dark:hover:bg-[#1F2C4D] transition"
                >
                  ยกเลิก
                </button>
                <button
                  id="save"
                  type="submit"
                  className="flex-2 py-3 px-4 rounded-xl text-base font-semibold bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] hover:opacity-90 transition shadow-sm"
                >
                  {initialTask ? 'บันทึกการแก้ไข' : 'บันทึกงาน'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
