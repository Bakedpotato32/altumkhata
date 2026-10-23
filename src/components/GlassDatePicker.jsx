import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check, Clock, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

const MONTH_NAMES_HI = [
  'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
  'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
];

const WEEKDAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

export const GlassDatePicker = ({ isOpen, onClose, value, onChange, title = 'वादा तारीख चुनें' }) => {
  if (!isOpen) return null;

  // Initialize selected date
  const initialDate = value ? new Date(value) : new Date();
  const [viewDate, setViewDate] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
  const [selectedDateStr, setSelectedDateStr] = useState(value || '');

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOffset = new Date(year, month, 1).getDay(); // 0 = Sunday

  const prevMonth = () => {
    triggerHaptic('light');
    setViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    triggerHaptic('light');
    setViewDate(new Date(year, month + 1, 1));
  };

  const formatDateYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleSelectDay = (dayNum) => {
    triggerHaptic('selection');
    const dateObj = new Date(year, month, dayNum);
    setSelectedDateStr(formatDateYMD(dateObj));
  };

  // Kirana Smart Presets
  const applyPreset = (type) => {
    triggerHaptic('medium');
    const today = new Date();
    let target = new Date();

    if (type === '7days') {
      target.setDate(today.getDate() + 7);
    } else if (type === '15days') {
      target.setDate(today.getDate() + 15);
    } else if (type === 'next1st') {
      // 1st of next month (pension / salary cycle)
      target = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else if (type === '30days') {
      target.setDate(today.getDate() + 30);
    }

    const ymd = formatDateYMD(target);
    setSelectedDateStr(ymd);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
  };

  const handleConfirm = () => {
    triggerHaptic('success');
    onChange(selectedDateStr);
    onClose();
  };

  const handleClear = () => {
    triggerHaptic('selection');
    onChange('');
    onClose();
  };

  const todayStr = formatDateYMD(new Date());

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] bg-slate-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-sm glass-card bg-white/95 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-white max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">{title}</h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  {selectedDateStr ? `चुनी तारीख: ${selectedDateStr}` : 'तारीख का चयन करें'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-90 flex items-center justify-center text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Rural Presets Row */}
          <div className="my-3">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>त्वरित विकल्प (Smart Presets)</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: '7days', label: '+7 दिन' },
                { id: '15days', label: '+15 दिन' },
                { id: 'next1st', label: '1 तारीख' },
                { id: '30days', label: '+30 दिन' }
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="py-1.5 px-1 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-[11px] font-bold border border-slate-200 active:scale-95 transition-all text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex items-center justify-between px-1 py-2 mb-2 bg-slate-50 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 active:scale-90 border border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-extrabold text-sm text-slate-800">
              {MONTH_NAMES_HI[month]} {year}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-700 active:scale-90 border border-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAYS_HI.map((w, idx) => (
              <span
                key={w}
                className={`text-[10px] font-bold uppercase ${
                  idx === 0 ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots before day 1 */}
            {Array.from({ length: startDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const thisDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDateStr === thisDateStr;
              const isToday = todayStr === thisDateStr;

              return (
                <button
                  type="button"
                  key={dayNum}
                  onClick={() => handleSelectDay(dayNum)}
                  className={`h-9 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative active:scale-90 ${
                    isSelected
                      ? 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/30'
                      : isToday
                      ? 'bg-blue-50 text-blue-600 border border-blue-300'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{dayNum}</span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-blue-600 -mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Actions Footer */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs active:scale-95 transition-all"
            >
              साफ़ करें
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>लागू करें</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
