import React from 'react';
import { ChatUser } from '../types';
import { X, Users, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';

interface OnlineUsersModalProps {
  isOpen: boolean;
  currentUser: ChatUser;
  onlineUsers: { id: string; name: string; avatar: string; color: string }[];
  onClose: () => void;
  onStartDM: (peer: ChatUser) => void;
  onOpenCreatePrivate: () => void;
}

export const OnlineUsersModal: React.FC<OnlineUsersModalProps> = ({
  isOpen,
  currentUser,
  onlineUsers,
  onClose,
  onStartDM,
  onOpenCreatePrivate,
}) => {
  if (!isOpen) return null;

  const otherUsers = onlineUsers.filter((u) => u.id !== currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col"
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

        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center text-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15203B] dark:text-white">
              เพื่อนที่ออนไลน์อยู่ ({onlineUsers.length} คน)
            </h2>
            <p className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
              กดที่เพื่อนเพื่อเปิดห้องแชทส่วนตัว (DM) แบบ 1:1 ได้ทันที
            </p>
          </div>
        </div>

        {/* Current User Card */}
        <div className="mb-3 p-3 rounded-2xl bg-slate-50 dark:bg-[#12192c] border border-[#DDE3EE] dark:border-[#2A3555] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs"
              style={{
                backgroundColor: `${currentUser.color}20`,
                border: `1.5px solid ${currentUser.color}`,
              }}
            >
              {currentUser.avatar}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#15203B] dark:text-white">
                  {currentUser.name}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#1F9D8B]/15 text-[#1F9D8B] font-semibold">
                  คุณ
                </span>
              </div>
              <span className="text-[11px] text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ออนไลน์อยู่
              </span>
            </div>
          </div>
        </div>

        {/* Other Users List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
          {otherUsers.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#1f2c4d] text-slate-400 flex items-center justify-center mx-auto mb-2.5 text-xl">
                ⏳
              </div>
              <h3 className="text-sm font-semibold text-[#15203B] dark:text-white">
                ยังไม่มีเพื่อนคนอื่นออนไลน์ในตอนนี้
              </h3>
              <p className="text-xs text-[#65708A] dark:text-[#9AA7C4] mt-1 max-w-xs mx-auto">
                คุณสามารถสร้างห้องส่วนตัวด้วยรหัสลับ แล้วส่งรหัสให้เพื่อนเข้ามาร่วมคุยได้เลย!
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreatePrivate();
                }}
                className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>สร้างห้องส่วนตัวด้วยรหัส</span>
              </button>
            </div>
          ) : (
            otherUsers.map((user) => (
              <div
                key={user.id}
                className="p-3 rounded-2xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] hover:border-[#1F9D8B]/50 transition flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${user.color || '#1F9D8B'}20`,
                      border: `1.5px solid ${user.color || '#1F9D8B'}`,
                    }}
                  >
                    {user.avatar || '🎓'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#15203B] dark:text-white truncate">
                      {user.name}
                    </p>
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      กำลังใช้งานอยู่
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onStartDM({
                      id: user.id,
                      name: user.name,
                      avatar: user.avatar,
                      color: user.color,
                    });
                    onClose();
                  }}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#1F9D8B] hover:bg-[#1F9D8B]/90 text-white shadow-2xs transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>คุยส่วนตัว</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#DDE3EE] dark:border-[#2A3555] shrink-0 flex items-center justify-between text-xs text-[#65708A] dark:text-[#9AA7C4]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            แชทส่วนตัวแบบ 1:1 มีเฉพาะคุณกับเพื่อน
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-[#15203B] dark:text-white hover:underline"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
