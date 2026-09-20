import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  taskTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  taskTitle,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="delete-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={onCancel}
        >
          <motion.div
            id="delete-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#172038] border border-[#DDE3EE] dark:border-[#2A3555] p-5 shadow-2xl text-[#15203B] dark:text-[#E8EDF8]"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center gap-3 mb-3 text-red-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold">ยืนยันการลบงาน</h3>
            </div>

            <p className="text-sm text-[#65708A] dark:text-[#9AA7C4] leading-relaxed mb-5">
              คุณต้องการลบงาน{' '}
              <span className="font-semibold text-[#15203B] dark:text-white">
                "{taskTitle}"
              </span>{' '}
              ใช่หรือไม่? ข้อมูลเวลาที่บันทึกไว้จะไม่สามารถกู้คืนได้
            </p>

            <div className="flex gap-2.5 justify-end">
              <button
                id="btn-cancel-delete"
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[#DDE3EE] dark:border-[#2A3555] bg-white dark:bg-[#1F2C4D] text-[#65708A] dark:text-[#E8EDF8] hover:bg-slate-50 dark:hover:bg-[#25365e] transition"
              >
                ยกเลิก
              </button>
              <button
                id="btn-confirm-delete"
                type="button"
                onClick={onConfirm}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white shadow-sm transition"
              >
                ลบงาน
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
