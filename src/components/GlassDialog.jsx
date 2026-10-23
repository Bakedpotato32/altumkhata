import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const GlassDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'ठीक है',
  cancelText = 'रद्द करें',
  type = 'info' // 'info' | 'danger' | 'success'
}) => {
  if (!isOpen) return null;

  const iconConfig = {
    danger: {
      bg: 'bg-rose-100 text-rose-600',
      btn: 'bg-rose-600 shadow-rose-500/25',
      Icon: AlertTriangle
    },
    success: {
      bg: 'bg-emerald-100 text-emerald-600',
      btn: 'bg-emerald-600 shadow-emerald-500/25',
      Icon: CheckCircle
    },
    info: {
      bg: 'bg-blue-100 text-blue-600',
      btn: 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25',
      Icon: Info
    }
  }[type] || {
    bg: 'bg-blue-100 text-blue-600',
    btn: 'bg-blue-600 shadow-blue-500/25',
    Icon: Info
  };

  const { Icon } = iconConfig;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-sm glass-card bg-white/95 rounded-3xl p-5 shadow-2xl border border-white relative text-center"
        >
          <div className={`w-14 h-14 rounded-2xl ${iconConfig.bg} flex items-center justify-center mx-auto mb-3 shadow-inner`}>
            <Icon className="w-7 h-7" />
          </div>

          <h3 className="text-base font-extrabold text-slate-800 leading-tight">
            {title}
          </h3>

          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
            {message}
          </p>

          <div className="flex gap-2.5 mt-5">
            {onConfirm && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-95 transition-all"
              >
                {cancelText}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic(type === 'danger' ? 'heavy' : 'success');
                if (onConfirm) onConfirm();
                else onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all ${iconConfig.btn}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
