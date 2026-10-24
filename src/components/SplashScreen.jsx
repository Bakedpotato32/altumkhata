import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white select-none overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

      {/* Top Branding Pill */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-blue-100 tracking-wider uppercase"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>डिजिटल किराना बहीखाता</span>
      </motion.div>

      {/* Center Hero Logo & Title */}
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 240, delay: 0.1 }}
          className="relative mb-5"
        >
          {/* Pulsing ring */}
          <div className="absolute -inset-2 rounded-3xl bg-white/20 blur-md animate-pulse" />
          
          <div className="relative w-24 h-24 rounded-3xl bg-white text-indigo-700 font-black text-5xl flex items-center justify-center shadow-2xl shadow-indigo-900/40 border-4 border-white/80">
            A
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1">
            ALTUM<span className="text-sky-300">KHATA</span>
          </h1>
          <p className="text-xs font-medium text-indigo-200 mt-1 tracking-wide">
            सुरक्षित • तेज़ • 100% ऑफ़लाइन बहीखाता
          </p>
        </motion.div>
      </div>

      {/* Bottom Creator Tribute */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 shadow-inner">
          <span className="text-xs font-bold text-white tracking-wide">
            Made by Karan with love
          </span>
          <motion.div
            animate={{ scale: [1, 1.25, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
          </motion.div>
        </div>
        <span className="text-[10px] text-indigo-200/80 font-medium tracking-widest uppercase">
          Version 1.0 • High Performance
        </span>
      </motion.div>
    </motion.div>
  );
};
