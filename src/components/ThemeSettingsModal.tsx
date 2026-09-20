import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sun, Moon, Palette, Grid, Check, Sparkles } from 'lucide-react';
import { ThemeColor, BgPattern } from '../types';

interface ThemeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: (dark: boolean) => void;
  themeColor: ThemeColor;
  onChangeThemeColor: (color: ThemeColor) => void;
  bgPattern: BgPattern;
  onChangeBgPattern: (pattern: BgPattern) => void;
}

export const THEME_COLORS: {
  id: ThemeColor;
  name: string;
  desc: string;
  lightBg: string;
  darkBg: string;
  accent: string;
  dotColor: string;
}[] = [
  {
    id: 'default',
    name: 'สเลทคลาสสิก',
    desc: 'สมุดเรียนสุขุม สบายตา',
    lightBg: '#F2F5FA',
    darkBg: '#0E1424',
    accent: '#1F9D8B',
    dotColor: '#3B82F6',
  },
  {
    id: 'ocean',
    name: 'โอเชียนบรีซ',
    desc: 'ฟ้าครามทะเล สดชื่นปลอดโปร่ง',
    lightBg: '#EFF6FF',
    darkBg: '#0B182B',
    accent: '#0284C7',
    dotColor: '#0EA5E9',
  },
  {
    id: 'lavender',
    name: 'ซอฟต์ลาเวนเดอร์',
    desc: 'ม่วงพาสเทล อ่อนโยนละมุน',
    lightBg: '#F5F3FF',
    darkBg: '#161026',
    accent: '#8B5CF6',
    dotColor: '#A855F7',
  },
  {
    id: 'emerald',
    name: 'ฟอเรสต์เอเมอรัลด์',
    desc: 'เขียวธรรมชาติ ผ่อนคลายสายตา',
    lightBg: '#F0FDF4',
    darkBg: '#071D15',
    accent: '#059669',
    dotColor: '#10B981',
  },
  {
    id: 'sunset',
    name: 'ซันเซ็ตแอมเบอร์',
    desc: 'โทนอุ่น มีชีวิตชีวา ปลุกไฟ',
    lightBg: '#FFFBEB',
    darkBg: '#1F1407',
    accent: '#D97706',
    dotColor: '#F59E0B',
  },
  {
    id: 'rose',
    name: 'ซากุระโรส',
    desc: 'ชมพูหวาน สดใส มีเสน่ห์',
    lightBg: '#FFF1F2',
    darkBg: '#220A14',
    accent: '#E11D48',
    dotColor: '#F43F5E',
  },
];

export const BG_PATTERNS: {
  id: BgPattern;
  name: string;
  desc: string;
  className: string;
}[] = [
  {
    id: 'none',
    name: 'เรียบหรู (ไม่มีลาย)',
    desc: 'พื้นหลังคลีน มินิมอล',
    className: 'pattern-none',
  },
  {
    id: 'dots',
    name: 'จุดกริดสมุดจด (Dots)',
    desc: 'สไตล์สมุด Bullet Journal',
    className: 'pattern-dots',
  },
  {
    id: 'grid',
    name: 'ตารางสมุดกราฟ (Grid)',
    desc: 'สไตล์สมุดจดคณิตศาสตร์/วิทย์',
    className: 'pattern-grid',
  },
  {
    id: 'stripes',
    name: 'ลายเส้นทแยง (Stripes)',
    desc: 'สไตล์สเก็ตช์ดีไซน์นำสมัย',
    className: 'pattern-stripes',
  },
  {
    id: 'sparkles',
    name: 'ดาวประกาย (Sparkles)',
    desc: 'เพิ่มบรรยากาศความสดใส',
    className: 'pattern-sparkles',
  },
];

export const ThemeSettingsModal: React.FC<ThemeSettingsModalProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme,
  themeColor,
  onChangeThemeColor,
  bgPattern,
  onChangeBgPattern,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="theme-settings-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#12192C] text-[#15203B] dark:text-[#E8EDF8] rounded-3xl shadow-2xl border border-[#DDE3EE] dark:border-[#2A3555] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#DDE3EE] dark:border-[#2A3555]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">ปรับแต่งธีม & ลวดลาย</h2>
                  <p className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                    ปรับสีพื้นหลัง ลวดลาย และโหมดมืด/สว่างได้ตามใจ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* 1. Appearance Mode: Light vs Dark */}
              <div>
                <label className="block text-sm font-bold mb-2.5 text-[#15203B] dark:text-[#E8EDF8]">
                  โทนสว่าง / โทนมืด (Appearance)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleTheme(false)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition text-left ${
                      !isDark
                        ? 'border-[#15203B] dark:border-teal-400 bg-slate-50 dark:bg-white/10 ring-2 ring-[#15203B]/20'
                        : 'border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#172038] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold flex items-center justify-between">
                        <span>โหมดสว่าง</span>
                        {!isDark && <Check className="w-4 h-4 text-[#15203B] dark:text-teal-400" />}
                      </div>
                      <div className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                        อ่านสบายตาในที่แจ้ง
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleTheme(true)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border transition text-left ${
                      isDark
                        ? 'border-[#15203B] dark:border-teal-400 bg-slate-50 dark:bg-white/10 ring-2 ring-teal-500/30'
                        : 'border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#172038] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold flex items-center justify-between">
                        <span>โหมดมืด</span>
                        {isDark && <Check className="w-4 h-4 text-[#15203B] dark:text-teal-400" />}
                      </div>
                      <div className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
                        ถนอมสายตาตอนกลางคืน
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 2. Theme Color Palette */}
              <div>
                <label className="block text-sm font-bold mb-2.5 text-[#15203B] dark:text-[#E8EDF8]">
                  สีธีมพื้นหลัง (Theme Palette)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {THEME_COLORS.map((tc) => {
                    const isSelected = themeColor === tc.id;
                    const previewBg = isDark ? tc.darkBg : tc.lightBg;
                    return (
                      <button
                        key={tc.id}
                        type="button"
                        onClick={() => onChangeThemeColor(tc.id)}
                        className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between relative overflow-hidden ${
                          isSelected
                            ? 'border-[#15203B] dark:border-teal-400 ring-2 ring-[#15203B]/20 dark:ring-teal-400/20'
                            : 'border-[#DDE3EE] dark:border-[#2A3555] hover:border-slate-400'
                        }`}
                        style={{ backgroundColor: previewBg }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="w-4 h-4 rounded-full shadow-xs"
                            style={{ backgroundColor: tc.dotColor }}
                          />
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-[#15203B] dark:bg-white text-white dark:text-[#15203B] flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#15203B] dark:text-white">
                            {tc.name}
                          </div>
                          <div className="text-[10px] text-[#65708A] dark:text-[#9AA7C4] truncate">
                            {tc.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Background Pattern */}
              <div>
                <label className="block text-sm font-bold mb-2.5 text-[#15203B] dark:text-[#E8EDF8]">
                  ลวดลายพื้นหลัง (Background Pattern)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BG_PATTERNS.map((bp) => {
                    const isSelected = bgPattern === bp.id;
                    return (
                      <button
                        key={bp.id}
                        type="button"
                        onClick={() => onChangeBgPattern(bp.id)}
                        className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 relative overflow-hidden ${
                          isSelected
                            ? 'border-[#15203B] dark:border-teal-400 bg-slate-50 dark:bg-white/10 ring-2 ring-[#15203B]/20 dark:ring-teal-400/20'
                            : 'border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#172038] hover:bg-slate-50 dark:hover:bg-[#1F2C4D]'
                        }`}
                      >
                        {/* Pattern Preview Box */}
                        <div
                          className={`w-10 h-10 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] shrink-0 ${bp.className} ${
                            isDark ? 'text-white/20 bg-[#0E1424]' : 'text-slate-800/15 bg-[#F2F5FA]'
                          } flex items-center justify-center`}
                        >
                          {bp.id === 'none' && (
                            <span className="text-xs text-[#65708A] dark:text-[#9AA7C4]">คลีน</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[#15203B] dark:text-white flex items-center justify-between">
                            <span>{bp.name}</span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-[#15203B] dark:text-teal-400" />
                            )}
                          </div>
                          <div className="text-[11px] text-[#65708A] dark:text-[#9AA7C4]">
                            {bp.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#DDE3EE] dark:border-[#2A3555] flex justify-end bg-slate-50 dark:bg-[#172038]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] hover:opacity-90 transition shadow-xs"
              >
                เสร็จสิ้น
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
