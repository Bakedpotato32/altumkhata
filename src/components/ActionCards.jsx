import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, MinusCircle, UserPlus, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic } from '../utils/haptics';

export const ActionCards = ({ onOpenTransaction, onOpenAddCustomer, onOpenSummary }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-3.5 my-4">
      {/* Blue Card: Udhari Diya (Debit) */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          triggerHaptic('medium');
          onOpenTransaction('diya');
        }}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-sky-400 via-blue-500 to-blue-600 text-white text-left shadow-lg shadow-blue-500/20 border border-white/30 flex flex-col justify-between h-40"
      >
        <div className="flex items-center justify-between w-full">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider">
            नाम लिखना
          </span>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <MinusCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold leading-tight">{t.giveCredit}</h3>
          <p className="text-[11px] text-blue-100 mt-0.5">सामान उधार दिया</p>
        </div>

        <div className="w-full py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-center text-xs font-bold border border-white/30">
          + उधार पर्ची
        </div>
      </motion.button>

      {/* Red/Tangerine Card: Jama Mila (Credit) */}
      <motion.button
        whileTap={{ scale: 0.94 }}
        onClick={() => {
          triggerHaptic('success');
          onOpenTransaction('liya');
        }}
        className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 text-white text-left shadow-lg shadow-rose-500/20 border border-white/30 flex flex-col justify-between h-40"
      >
        <div className="flex items-center justify-between w-full">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-extrabold uppercase tracking-wider">
            पैसा मिला
          </span>
          <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
            <PlusCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-base font-bold leading-tight">{t.receivePayment}</h3>
          <p className="text-[11px] text-rose-100 mt-0.5">नकद जमा किया</p>
        </div>

        <div className="w-full py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-center text-xs font-bold border border-white/30">
          ✓ जमा पर्ची
        </div>
      </motion.button>
    </div>
  );
};
