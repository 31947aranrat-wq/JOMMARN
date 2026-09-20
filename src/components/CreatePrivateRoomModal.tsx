import React, { useState } from 'react';
import { ChatRoom } from '../types';
import { generateRoomCode } from '../utils/chatStorage';
import { X, Lock, Key, Copy, Check, Users, Sparkles, LogIn } from 'lucide-react';

interface CreatePrivateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinRoom: (room: ChatRoom) => void;
}

export const CreatePrivateRoomModal: React.FC<CreatePrivateRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinRoom,
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [roomCode, setRoomCode] = useState(() => `ROOM-${generateRoomCode()}`);
  const [roomName, setRoomName] = useState('');
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerateCode = () => {
    setRoomCode(`ROOM-${generateRoomCode()}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('กรุณาระบุรหัสห้อง');
      return;
    }

    const name = roomName.trim() || `ห้องส่วนตัว #${cleanCode}`;
    const newRoom: ChatRoom = {
      id: `priv_${cleanCode.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`,
      name,
      description: `ห้องส่วนตัวเฉพาะคนที่มีรหัส ${cleanCode}`,
      isPrivate: true,
      roomCode: cleanCode,
      icon: 'Lock',
    };

    onJoinRoom(newRoom);
    onClose();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputJoinCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('กรุณากรอกรหัสห้องเพื่อเข้าร่วม');
      return;
    }

    const newRoom: ChatRoom = {
      id: `priv_${cleanCode.toLowerCase().replace(/[^a-z0-9_-]/g, '')}`,
      name: `ห้องส่วนตัว #${cleanCode}`,
      description: `ห้องส่วนตัวเฉพาะคนที่มีรหัส ${cleanCode}`,
      isPrivate: true,
      roomCode: cleanCode,
      icon: 'Lock',
    };

    onJoinRoom(newRoom);
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center text-xl">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#15203B] dark:text-white">ห้องแชทส่วนตัว (Private Room)</h2>
            <p className="text-xs text-[#65708A] dark:text-[#9AA7C4]">
              คุยเฉพาะกลุ่มเพื่อนหรือคู่หูติว ด้วยรหัสห้องลับ
            </p>
          </div>
        </div>

        {/* Tabs: Create vs Join */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-[#12192c] rounded-2xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setTab('create');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === 'create'
                ? 'bg-white dark:bg-[#1e2947] text-[#15203B] dark:text-white shadow-xs'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#1F9D8B]" />
            <span>สร้างห้องใหม่</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('join');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === 'join'
                ? 'bg-white dark:bg-[#1e2947] text-[#15203B] dark:text-white shadow-xs'
                : 'text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-amber-500" />
            <span>เข้าร่วมด้วยรหัส</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 px-3.5 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE] mb-1.5">
                ชื่อห้องส่วนตัว (ระบุหรือไม่ก็ได้)
              </label>
              <input
                type="text"
                value={roomName}
                maxLength={30}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="เช่น ห้องติวฟิสิกส์ ม.5, คู่หูปั่นโครงงาน"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] bg-slate-50 dark:bg-[#12192c] text-[#15203B] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#1F9D8B]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE]">
                  รหัสห้องลับ (แชร์ให้เพื่อน)
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateCode}
                  className="text-[11px] text-[#1F9D8B] hover:underline"
                >
                  สุ่มรหัสใหม่
                </button>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 font-mono font-bold text-sm tracking-wider flex items-center justify-between">
                  <span>{roomCode}</span>
                  <Key className="w-4 h-4 text-amber-500/60" />
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-2.5 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#1e2947] text-[#15203B] dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-[#253358] transition flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#65708A] dark:text-[#9AA7C4]" />
                      <span>คัดลอกรหัส</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#65708A] dark:text-[#9AA7C4] mt-1.5">
                * ส่งรหัสนี้ให้เพื่อน เมื่อเพื่อนนำรหัสนี้ไปใส่ จะสามารถเข้ามาร่วมคุยในห้องนี้ได้ทันที
              </p>
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
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <Lock className="w-4 h-4" />
                <span>สร้างและเข้าห้อง</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#15203B] dark:text-[#DDE3EE] mb-1.5">
                กรอกรหัสห้องลับที่ได้รับจากเพื่อน
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputJoinCode}
                  onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                  placeholder="เช่น ROOM-A4B7C9"
                  maxLength={20}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#DDE3EE] dark:border-[#2A3555] bg-slate-50 dark:bg-[#12192c] text-[#15203B] dark:text-white font-mono uppercase tracking-wider text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <Key className="w-4 h-4 text-[#65708A] dark:text-[#9AA7C4] absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] text-[#65708A] dark:text-[#9AA7C4] mt-1.5">
                ใส่รหัสห้องส่วนตัวที่เพื่อนสร้างไว้ เพื่อเข้าห้องคุยและร่วมทำการบ้านด้วยกัน
              </p>
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
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าร่วมห้องส่วนตัว</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
