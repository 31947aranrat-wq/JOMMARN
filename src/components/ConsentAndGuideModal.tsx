import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  CheckCircle,
  ShieldCheck,
  CheckSquare,
  MessageSquare,
  Palette,
  Users,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';

interface ConsentAndGuideModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onClose?: () => void;
  isFirstVisit: boolean;
}

export const ConsentAndGuideModal: React.FC<ConsentAndGuideModalProps> = ({
  isOpen,
  onAccept,
  onClose,
  isFirstVisit,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'terms'>('guide');
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="consent-guide-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4"
          onClick={() => {
            if (!isFirstVisit && onClose) onClose();
          }}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl bg-white dark:bg-[#12192C] text-[#15203B] dark:text-[#E8EDF8] rounded-3xl shadow-2xl border border-[#DDE3EE] dark:border-[#2A3555] overflow-hidden flex flex-col max-h-[92vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-[#DDE3EE] dark:border-[#2A3555] bg-[#F8FAFD] dark:bg-[#172038] flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1F9D8B]/15 text-[#1F9D8B] flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
                  ✨
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-[#15203B] dark:text-white">
                      Jommarn (จอมมาร)
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#1F9D8B]/15 text-[#1F9D8B]">
                      คู่มือ & ข้อตกลง
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4] mt-0.5">
                    {isFirstVisit
                      ? 'กรุณาอ่านคำแนะนำการใช้งานและกดยินยอมข้อตกลงก่อนเข้าใช้งาน'
                      : 'คำแนะนำการใช้งานและข้อกำหนดของแอปพลิเคชัน'}
                  </p>
                </div>
              </div>

              {!isFirstVisit && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#65708A] dark:text-[#9AA7C4] hover:bg-slate-200 dark:hover:bg-[#1F2C4D] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#12192C] px-6">
              <button
                type="button"
                onClick={() => setActiveTab('guide')}
                className={`py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'guide'
                    ? 'border-[#1F9D8B] text-[#1F9D8B]'
                    : 'border-transparent text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>คำแนะนำการใช้งาน</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('terms')}
                className={`py-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition ${
                  activeTab === 'terms'
                    ? 'border-[#1F9D8B] text-[#1F9D8B]'
                    : 'border-transparent text-[#65708A] dark:text-[#9AA7C4] hover:text-[#15203B] dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>ข้อตกลงการใช้งาน</span>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-sm leading-relaxed">
              {activeTab === 'guide' ? (
                <div className="space-y-5">
                  {/* Feature 1 */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555]">
                    <div className="flex items-center gap-2.5 font-bold text-base text-[#15203B] dark:text-white mb-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center text-sm">
                        1
                      </div>
                      <span>ระบบวางแผนงาน เริ่มทีละนิด ส่งงานทัน (Planner)</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4] ml-2">
                      <li>• <b>เพิ่มงาน</b>: ระบุวิชา หน่วยกิต (0.5 - 3) ความสำคัญ (1-5) และวันส่ง</li>
                      <li>• <b>คำนวณเวลาอัตโนมัติ</b>: ระบบจะกระจายเวลาให้อัตโนมัติว่า "วันนี้ควรทำกี่นาที" เพื่อให้ส่งทันโดยไม่ต้องโต้รุ่งคืนก่อนส่ง</li>
                      <li>• <b>บันทึกความคืบหน้า</b>: กดปุ่ม <b>+10 นาที</b> หรือ <b>+30 นาที</b> เพื่อเก็บเวลาที่ทำจริง และกด <b>เสร็จแล้ว</b> เมื่องานสำเร็จ</li>
                    </ul>
                  </div>

                  {/* Feature 2: Categories */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555]">
                    <div className="flex items-center gap-2.5 font-bold text-base text-[#15203B] dark:text-white mb-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                        2
                      </div>
                      <span>หมวดหมู่งาน 3 ระดับ (Categories)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                      <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
                        <div className="font-bold text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                          <span>🏫</span> งานของห้อง
                        </div>
                        <p className="text-[11px] text-blue-600/80 dark:text-blue-300/70 mt-1">
                          การบ้านหรือใบงานที่ต้องส่งพร้อมกันทั้งห้องเรียน
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/40">
                        <div className="font-bold text-xs text-purple-700 dark:text-purple-300 flex items-center gap-1">
                          <span>👥</span> งานกลุ่มเพื่อน
                        </div>
                        <p className="text-[11px] text-purple-600/80 dark:text-purple-300/70 mt-1">
                          โครงงาน งานนำเสนอ หรือรายงานที่ทำร่วมกับเพื่อน
                        </p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800/40">
                        <div className="font-bold text-xs text-teal-700 dark:text-teal-300 flex items-center gap-1">
                          <span>👤</span> งานส่วนตัว
                        </div>
                        <p className="text-[11px] text-teal-600/80 dark:text-teal-300/70 mt-1">
                          งานเดี่ยว การอ่านหนังสือสอบ หรือเป้าหมายตนเอง
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature 3: Chat */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555]">
                    <div className="flex items-center gap-2.5 font-bold text-base text-[#15203B] dark:text-white mb-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm">
                        3
                      </div>
                      <span>ระบบแชทสาธารณะ & แชทส่วนตัวด้วยรหัสลับ</span>
                    </div>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4] ml-2">
                      <li>• <b>🌐 ห้องแชทสาธารณะ</b>: ทุกคนที่มีลิ้งก์แอปสามารถเข้ามาร่วมคุย ปรึกษาโจทย์ และแลกเปลี่ยนกันได้สดๆ ทันที</li>
                      <li>• <b>🔒 ห้องส่วนตัวด้วยรหัสลับ</b>: สร้างห้องลับเพื่อส่งรหัสให้เพื่อนในกลุ่ม หรือแชท 1:1 แบบสองต่อสอง</li>
                      <li>• <b>📌 แท็กการบ้าน</b>: สามารถเลือกชื่องานของคุณแนบไปในข้อความเพื่อถามเพื่อนได้ในคลิกเดียว</li>
                    </ul>
                  </div>

                  {/* Feature 4: Theme */}
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555]">
                    <div className="flex items-center gap-2.5 font-bold text-base text-[#15203B] dark:text-white mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm">
                        4
                      </div>
                      <span>ปรับแต่งธีม ลวดลาย และโหมดมืด/สว่าง</span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4]">
                      กดปุ่ม <b>"ปรับแต่งธีม"</b> เพื่อเปลี่ยนสีพื้นหลังได้ถึง 6 โทนสี (สเลท, โอเชียน, ลาเวนเดอร์, เอเมอรัลด์, ซันเซ็ต, ซากุระ) พร้อมเลือกลวดลายสมุดจด (จุดกริด, ตารางกราฟ, ลายทแยง, ดาวประกาย) และสลับโหมดมืด/สว่างได้ทุกเวลา
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-[#F8FAFD] dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] space-y-3">
                    <h3 className="font-bold text-base text-[#15203B] dark:text-white">
                      ข้อตกลงและเงื่อนไขการใช้งาน (Terms of Use)
                    </h3>
                    <p className="text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4]">
                      ยินดีต้อนรับสู่แอปพลิเคชัน <b>Jommarn</b> การเข้าใช้งานแอปพลิเคชันนี้ถือว่าคุณยอมรับข้อตกลงดังต่อไปนี้:
                    </p>
                    <div className="space-y-2.5 text-xs sm:text-sm text-[#65708A] dark:text-[#9AA7C4]">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span><b>1. วัตถุประสงค์เพื่อการศึกษา</b>: ใช้เพื่อการวางแผนการเรียน จัดการตารางส่งงาน และแลกเปลี่ยนความรู้ในหมู่นักเรียน/นักศึกษาอย่างสร้างสรรค์</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span><b>2. มารยาทในการสนทนา</b>: ห้ามใช้คำหยาบคาย ข้อความคุกคาม กลั่นแกล้ง หรือข้อความที่สร้างความแตกแยกในการสนทนาทุกช่องทาง</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span><b>3. การคุ้มครองข้อมูลส่วนบุคคล</b>: ห้ามเผยแพร่ข้อมูลส่วนบุคคลที่เป็นความลับ ข้อมูลบัญชี หรือเนื้อหาที่ละเมิดลิขสิทธิ์</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span><b>4. ความปลอดภัยของข้อมูลในเครื่อง</b>: ข้อมูลตารางงานของคุณได้รับการบันทึกบนหน่วยความจำภายในอุปกรณ์อย่างปลอดภัย</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Consent Checkbox */}
            <div className="p-5 sm:p-6 border-t border-[#DDE3EE] dark:border-[#2A3555] bg-[#F8FAFD] dark:bg-[#172038] flex flex-col gap-3">
              {isFirstVisit && (
                <label className="flex items-start sm:items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAgreed}
                    onChange={(e) => setIsAgreed(e.target.checked)}
                    className="w-5 h-5 rounded-md text-[#1F9D8B] focus:ring-[#1F9D8B] mt-0.5 sm:mt-0 accent-[#1F9D8B] cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm font-medium text-[#15203B] dark:text-[#E8EDF8]">
                    ข้าพเจ้าได้อ่าน เข้าใจคำแนะนำการใช้งาน และยินยอมปฏิบัติตามข้อตกลงการใช้งานแอปพลิเคชัน
                  </span>
                </label>
              )}

              <div className="flex items-center justify-between gap-3 pt-1">
                {activeTab === 'guide' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('terms')}
                    className="text-xs sm:text-sm font-semibold text-[#1F9D8B] hover:underline"
                  >
                    ดูข้อตกลงการใช้งาน →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('guide')}
                    className="text-xs sm:text-sm font-semibold text-[#1F9D8B] hover:underline"
                  >
                    ← กลับไปดูคู่มือใช้งาน
                  </button>
                )}

                {isFirstVisit ? (
                  <button
                    type="button"
                    disabled={!isAgreed}
                    onClick={onAccept}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition shadow-xs ${
                      isAgreed
                        ? 'bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] hover:opacity-90 cursor-pointer'
                        : 'bg-slate-300 text-slate-500 dark:bg-[#2A3555] dark:text-[#65708A] cursor-not-allowed opacity-70'
                    }`}
                  >
                    ยินยอมและเริ่มใช้งาน
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#15203B] text-white dark:bg-[#E8EDF8] dark:text-[#0E1424] hover:opacity-90 transition shadow-xs"
                  >
                    รับทราบและปิด
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
