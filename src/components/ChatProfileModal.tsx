import React, { useState } from 'react';
import { ChatUser } from '../types';
import { AVATAR_OPTIONS, COLOR_OPTIONS, saveChatUser } from '../utils/chatStorage';
import { X, Check, Sparkles } from 'lucide-react';

interface ChatProfileModalProps {
  isOpen: boolean;
  currentUser: ChatUser;
  onClose: () => void;
  onSave: (updated: ChatUser) => void;
}

export const ChatProfileModal: React.FC<ChatProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [color, setColor] = useState(currentUser.color);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim() || 'เพื่อนร่วมชั้น';
    const updated: ChatUser = {
      ...currentUser,
      name: trimmed,
      avatar,
      color,
    };
    saveChatUser(updated);
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-3xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-xs"
            style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
          >
            {avatar}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15203B] dark:text-white">ตั้งค่าโปรไฟล์คุยกับเพื่อน</h2>
            <p className="text-xs text-[#65708A] dark:text-[#9AA7C4]">ชื่อและอวตารของคุณในห้องแชท</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE] mb-1.5">
              ชื่อที่แสดง (Nickname)
            </label>
            <input
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น ต้นกล้า ม.6, ส้มโอ ปั่นงาน"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] bg-slate-50 dark:bg-[#12192c] text-[#15203B] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F9D8B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE] mb-1.5">
              เลือกอวตาร
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`h-11 rounded-xl flex items-center justify-center text-xl border transition ${
                    avatar === av
                      ? 'border-[#1F9D8B] bg-[#1F9D8B]/15 scale-105 shadow-xs'
                      : 'border-[#DDE3EE] dark:border-[#2A3555] hover:bg-slate-100 dark:hover:bg-[#1F2C4D]'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE] mb-1.5">
              สีประจำตัว
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-white transition ${
                    color === c ? 'ring-2 ring-offset-2 ring-[#1F9D8B] dark:ring-offset-[#172038] scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-xl text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-100 dark:hover:bg-[#1F2C4D] transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl bg-[#1F9D8B] text-white hover:bg-[#1F9D8B]/90 transition flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4" />
              <span>บันทึกข้อมูล</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
