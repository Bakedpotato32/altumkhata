import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Search, Calendar, UserPlus, MapPin, CheckCircle2, User } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useLanguage } from '../context/LanguageContext';
import { GlassDatePicker } from './GlassDatePicker';
import { formatCurrency } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];
const KIRANA_TAGS = ['राशन (Ration)', 'तेल / मसाला', 'दूध / दही', 'दाल / चावल', 'सब्जी / फल', 'नकद उधार', 'खाता चुकता'];

export const TransactionModal = ({
  isOpen,
  onClose,
  type,
  customers,
  onAddTransaction,
  onOpenAddCustomer,
  preSelectedCustomerId = null
}) => {
  const { t } = useLanguage();
  const [selectedCustomerId, setSelectedCustomerId] = useState(preSelectedCustomerId || '');
  const [customerSearch, setCustomerSearch] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedTag, setSelectedTag] = useState(KIRANA_TAGS[0]);
  const [note, setNote] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Sync pre-selected customer if opened directly from a customer profile
  React.useEffect(() => {
    if (preSelectedCustomerId) {
      setSelectedCustomerId(preSelectedCustomerId);
    }
  }, [preSelectedCustomerId]);

  // Filter customers by search term
  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const query = customerSearch.toLowerCase();
    return customers.filter((c) =>
      c.name.toLowerCase().includes(query) ||
      (c.nickname && c.nickname.toLowerCase().includes(query)) ||
      c.village.toLowerCase().includes(query) ||
      (c.phone && c.phone.includes(query))
    );
  }, [customers, customerSearch]);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

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
    setCustomerSearch('');
    setCustomDate('');
    if (!preSelectedCustomerId) {
      setSelectedCustomerId('');
    }
  };

  const isDiya = type === 'diya';

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className={`p-4 text-white flex items-center justify-between ${
            isDiya ? 'bg-gradient-to-r from-sky-500 to-blue-600' : 'bg-gradient-to-r from-rose-500 to-orange-500'
          }`}>
            <div>
              <h3 className="text-lg font-extrabold">
                {isDiya ? t.giveCredit : t.receivePayment}
              </h3>
              <p className="text-xs text-white/80">
                {isDiya ? 'उधार नामे लिखें (बकाया बढ़ेगा)' : 'जमा प्राप्त करें (बकाया घटेगा)'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 active:scale-90 flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Customer Picker Section */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">ग्राहक चुनें *</label>
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedCustomerId('');
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    ग्राहक बदलें
                  </button>
                )}
              </div>

              {selectedCustomer ? (
                /* Selected Customer Banner */
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    {selectedCustomer.photo ? (
                      <img
                        src={selectedCustomer.photo}
                        alt={selectedCustomer.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center shadow-sm">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-slate-800">
                          {selectedCustomer.name}
                        </span>
                        {selectedCustomer.nickname && (
                          <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                            {selectedCustomer.nickname}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {selectedCustomer.village} • {selectedCustomer.phone || 'मोबाइल नहीं'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">वर्तमान बाकी</span>
                    <span className={`text-sm font-black ${
                      selectedCustomer.balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {formatCurrency(selectedCustomer.balance)}
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* Customer Live Search & Selection Box */
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ग्राहक का नाम, उपनाम या गाँव खोजें..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Customer Scroll List */}
                  <div className="max-h-44 overflow-y-auto space-y-1.5 p-1 border border-slate-200/90 rounded-2xl bg-slate-50/60 no-scrollbar">
                    {filteredCustomers.length === 0 ? (
                      <div className="p-3 text-center">
                        <p className="text-xs text-slate-400 font-medium">कोई ग्राहक नहीं मिला</p>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onOpenAddCustomer();
                          }}
                          className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>नया ग्राहक जोड़ें</span>
                        </button>
                      </div>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            triggerHaptic('selection');
                            setSelectedCustomerId(c.id);
                          }}
                          className="w-full p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-100 flex items-center justify-between text-left active:scale-[0.98] transition-all"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {c.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-xs text-slate-800">{c.name}</span>
                                {c.nickname && (
                                  <span className="text-[10px] text-indigo-600 font-semibold">
                                    ({c.nickname})
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">{c.village}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-xs font-black ${
                              c.balance > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}>
                              {formatCurrency(c.balance)}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
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

            {/* Date & Note Row */}
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

            {/* Submit Button */}
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

          {/* Date Picker Modal */}
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
