import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, FileText, MapPin, AlertCircle, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency, sendWhatsAppReminder, dialPhone } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';

export const CustomerCard = ({ customer, shop, onSelectCustomer, onOpenReceipt }) => {
  const { t, lang } = useLanguage();
  const isOverLimit = customer.balance > customer.creditLimit;
  const isSettled = customer.balance <= 0;

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.98 }}
      className="glass-card rounded-2xl p-4 mb-3 transition-all relative overflow-hidden"
    >
      <div 
        onClick={() => {
          triggerHaptic('light');
          onSelectCustomer(customer);
        }}
        className="flex items-center justify-between cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Photo Avatar or Initial Squircle */}
          <div className="relative">
            {customer.photo ? (
              <img
                src={customer.photo}
                alt={customer.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-200"
              />
            ) : (
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg text-white shadow-md ${
                isSettled 
                  ? 'bg-gradient-to-tr from-emerald-400 to-teal-500 shadow-teal-500/20' 
                  : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-indigo-500/20'
              }`}>
                {customer.name.charAt(0)}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-slate-800 text-base leading-tight">
                {customer.name}
              </h4>
              {customer.nickname && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[10px] font-extrabold">
                  ({customer.nickname})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                {customer.village}
              </span>
              <span>•</span>
              <span>{customer.phone || 'नंबर नहीं'}</span>
            </div>

            {customer.promiseDate && (
              <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 mt-1">
                <Calendar className="w-3 h-3" />
                <span>वादा: {customer.promiseDate}</span>
              </div>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="text-right">
          <span className={`text-base font-extrabold ${
            isSettled ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {formatCurrency(customer.balance)}
          </span>
          <p className="text-[10px] font-semibold text-slate-400 uppercase">
            {isSettled ? t.paidInFull : t.totalBalance}
          </p>
        </div>
      </div>

      {/* Triple-Action Row */}
      {!isSettled && (
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('medium');
              sendWhatsAppReminder({ customer, shop, mode: 'polite', lang });
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 active:scale-95 text-emerald-700 text-xs font-bold transition-all border border-emerald-200/60"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>व्हाट्सएप</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              dialPhone(customer.phone);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-sky-50 hover:bg-sky-100 active:scale-95 text-sky-700 text-xs font-bold transition-all border border-sky-200/60"
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span>कॉल</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('selection');
              onOpenReceipt(customer);
            }}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-700 text-xs font-bold transition-all border border-indigo-200/60"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>पर्ची</span>
          </button>
        </div>
      )}
    </motion.div>
  );
};
