import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Trash2, MessageSquare, Phone, FileText, AlertTriangle, UserX } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatCurrency, sendWhatsAppReminder, dialPhone } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';
import { useLanguage } from '../context/LanguageContext';

export const CustomerPassbookModal = ({
  isOpen,
  onClose,
  customer,
  shop,
  transactions,
  onSettleAll,
  onDeleteTransaction,
  onDeleteCustomer,
  onOpenReceipt
}) => {
  const { t, lang } = useLanguage();
  const [waMode, setWaMode] = useState('polite');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isOpen || !customer) return null;

  const customerTransactions = transactions
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = () => {
    triggerHaptic('heavy');
    onDeleteCustomer(customer.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {customer.photo ? (
                <img src={customer.photo} alt={customer.name} className="w-12 h-12 rounded-2xl object-cover border" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                  {customer.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                  {customer.name}
                  {customer.nickname && <span className="text-sm font-bold text-indigo-600 ml-1.5">({customer.nickname})</span>}
                </h3>
                <p className="text-xs text-slate-500">{customer.village} • {customer.phone || 'मोबाइल नहीं'}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowDeleteConfirm(true);
                }}
                title={t.deleteCustomer}
                className="w-9 h-9 rounded-full bg-rose-50 hover:bg-rose-100 active:scale-90 flex items-center justify-center text-rose-600 transition-all border border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  triggerHaptic('selection');
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 active:scale-90 flex items-center justify-center text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Balance & Settle All Button */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-blue-200 uppercase font-semibold">कुल बाकी राशि</span>
              <h2 className="text-2xl font-black">{formatCurrency(customer.balance)}</h2>
            </div>

            {customer.balance > 0 && (
              <button
                onClick={() => {
                  confetti({ particleCount: 70, spread: 70, origin: { y: 0.7 } });
                  onSettleAll(customer.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                <span>पूरा चुकता करें</span>
              </button>
            )}
          </div>

          {/* 3-Tone WhatsApp Tagaada Selector */}
          {customer.balance > 0 && (
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">व्हाट्सएप तगादा:</span>
              <div className="flex gap-1.5">
                {[
                  { id: 'polite', label: 'नम्र' },
                  { id: 'festive', label: 'मासिक' },
                  { id: 'firm', label: 'सख्त' }
                ].map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setWaMode(tone.id);
                      sendWhatsAppReminder({ customer, shop, mode: tone.id, lang });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      waMode === tone.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Transactions */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 no-scrollbar">
            <h4 className="text-xs font-bold text-slate-500 uppercase">खाता पासबुक प्रविष्टियां</h4>
            {customerTransactions.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-8">कोई लेन-देन दर्ज नहीं है</p>
            ) : (
              customerTransactions.map((tx) => (
                <div key={tx.id} className="p-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">{tx.tag}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(tx.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    {tx.note && <p className="text-[11px] text-slate-500 mt-0.5">{tx.note}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm ${tx.type === 'diya' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'diya' ? '-' : '+'} {formatCurrency(tx.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Actions */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => dialPhone(customer.phone)}
              className="py-2.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-sky-200 active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>कॉल करें</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenReceipt(customer);
              }}
              className="py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-indigo-200 active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>रसीद पर्ची देखें</span>
            </button>
          </div>

          {/* Delete Confirmation Overlay */}
          {showDeleteConfirm && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-center">
              <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">{t.deleteCustomer}?</h3>
                <p className="text-xs text-slate-500 mt-1">{t.confirmDeleteCust}</p>
                {customer.balance > 0 && (
                  <p className="text-xs font-bold text-rose-600 mt-2 bg-rose-50 p-2 rounded-xl">
                    {t.dueDeleteWarning} (बाकी: {formatCurrency(customer.balance)})
                  </p>
                )}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs active:scale-95"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleDelete}
                    className="py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs active:scale-95 shadow-md shadow-rose-500/25"
                  >
                    हाँ, हटाएं
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
