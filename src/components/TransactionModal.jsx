import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { GlassDatePicker } from './GlassDatePicker';
import { triggerHaptic } from '../utils/haptics';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];
const KIRANA_TAGS = ['राशन (Ration)', 'तेल / मसाला', 'दूध / दही', 'दाल / चावल', 'सब्जी / फल', 'नकद उधार', 'खाता चुकता'];

export const TransactionModal = ({ isOpen, onClose, type, customers, onAddTransaction }) => {
  const { t } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedTag, setSelectedTag] = useState(KIRANA_TAGS[0]);
  const [note, setNote] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount || Number(amount) <= 0) return;

    onAddTransaction({
      customerId: selectedCustomerId,
      type,
      amount: Number(amount),
      tag: selectedTag,
      note,
      date: customDate ? new Date(customDate).toISOString() : new Date().toISOString()
    });

    if (type === 'liya') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    onClose();
    setAmount('');
    setNote('');
    setCustomDate('');
  };

  const isDiya = type === 'diya';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Modal Header */}
          <div className={`p-4 text-white flex items-center justify-between ${
            isDiya ? 'bg-gradient-to-r from-sky-500 to-blue-600' : 'bg-gradient-to-r from-rose-500 to-orange-500'
          }`}>
            <div>
              <h3 className="text-lg font-extrabold">
                {isDiya ? t.giveCredit : t.receivePayment}
              </h3>
              <p className="text-xs text-white/80">
                {isDiya ? 'ग्राहक के नाम पर उधार जोड़ें' : 'ग्राहक से जमा प्राप्त करें'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Customer Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ग्राहक चुनें *</label>
              <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-200 rounded-2xl bg-slate-50">
                {customers.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedCustomerId(c.id);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                      selectedCustomerId === c.id
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-md'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    <div className="truncate font-bold">{c.name}</div>
                    <div className={`text-[10px] ${selectedCustomerId === c.id ? 'text-blue-100' : 'text-slate-400'}`}>
                      {c.nickname ? `(${c.nickname})` : c.village}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.amount} *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 border-2 border-transparent focus:border-blue-500 focus:bg-white text-2xl font-black text-slate-800 outline-none transition-all"
                />
              </div>
            </div>

            {/* Quick Currency Chips */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">{t.quickChips}</span>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setAmount(String((Number(amount) || 0) + amt));
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-xs font-bold text-slate-700 border border-slate-200"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Kirana Category Tags */}
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase">{t.itemTag}</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {KIRANA_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedTag(tag);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Date Picker Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">लेन-देन तारीख</label>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDatePickerOpen(true);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center justify-between"
                >
                  <span className="text-slate-800 font-bold">{customDate || 'आज (Today)'}</span>
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.addNote}</label>
                <input
                  type="text"
                  placeholder="उदा. 5kg चावल, 1L तेल"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!selectedCustomerId || !amount}
              className={`w-full py-3.5 rounded-2xl text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isDiya
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/25'
                  : 'bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-500/25'
              } disabled:opacity-50`}
            >
              <Check className="w-5 h-5" />
              <span>{t.confirmEntry}</span>
            </button>
          </form>

          {/* Frosted Glass Date Picker Modal */}
          <GlassDatePicker
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            value={customDate}
            onChange={setCustomDate}
            title="लेन-देन की तारीख चुनें"
          />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
