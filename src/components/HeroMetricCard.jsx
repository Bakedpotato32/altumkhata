import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Wallet, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/whatsapp';

export const HeroMetricCard = ({ totalReceivables, todayCollected, activeCount, onShowSummary }) => {
  const { t } = useLanguage();
  const [animatedTotal, setAnimatedTotal] = useState(0);

  // Smooth rolling metric counter using requestAnimationFrame
  useEffect(() => {
    let startTimestamp = null;
    const duration = 900;
    const startVal = animatedTotal;
    const endVal = totalReceivables;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setAnimatedTotal(Math.floor(startVal + (endVal - startVal) * easeProgress));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [totalReceivables]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white shadow-2xl shadow-indigo-500/25 border border-white/20"
    >
      {/* Background ambient circular gradients */}
      <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-indigo-400/20 blur-xl pointer-events-none" />

      {/* Top Status Bar matching AltumStamp Studio */}
      <div className="flex items-center justify-between mb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 tracking-wide">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>{t.heroBadge}</span>
        </div>
        <button
          onClick={onShowSummary}
          className="text-xs font-semibold text-indigo-100 hover:text-white flex items-center gap-1 transition-colors"
        >
          {t.reports} <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric Title & Counter */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-200 mb-1">
          {t.totalReceivables}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold tracking-tight">
            {formatCurrency(animatedTotal)}
          </span>
        </div>
      </div>

      {/* Inner Two Frosted Pill Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3.5 bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-200 mb-1">
            <span className="text-[11px] font-medium">{t.todayCollected}</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-lg font-bold text-emerald-300">
            {formatCurrency(todayCollected)}
          </span>
        </div>

        <div className="rounded-2xl p-3.5 bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-200 mb-1">
            <span className="text-[11px] font-medium">{t.netActiveCustomers}</span>
            <Wallet className="w-3.5 h-3.5 text-sky-300" />
          </div>
          <span className="text-lg font-bold text-white">
            {activeCount} <span className="text-xs font-normal text-indigo-200">खाते</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
