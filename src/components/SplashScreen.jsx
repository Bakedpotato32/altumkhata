import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';

export const SplashScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between py-14 px-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white select-none overflow-hidden"
    >
      {/* Floating Background Glow Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, 20, 0],
          y: [0, 25, 0]
        }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-400/25 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          x: [0, -20, 0],
          y: [0, -20, 0]
        }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-fuchsia-500/25 blur-3xl pointer-events-none"
      />

      {/* Top Status Pill */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-xs font-bold text-blue-100 tracking-wider shadow-lg"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
        <span>डिजिटल किराना बहीखाता</span>
      </motion.div>

      {/* Center Branding & Progress */}
      <div className="flex flex-col items-center text-center my-auto">
        <motion.div
          initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', damping: 16, stiffness: 240, delay: 0.1 }}
          className="relative mb-5"
        >
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-cyan-400 to-indigo-400 blur-md pointer-events-none"
          />

          <div className="relative w-24 h-24 rounded-3xl bg-white text-indigo-700 font-black text-5xl flex items-center justify-center shadow-2xl shadow-indigo-950/40 border-4 border-white/90">
            <span className="bg-gradient-to-tr from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              A
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            ALTUM<span className="text-sky-300">KHATA</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-[11px] font-extrabold uppercase">
              PRO
            </span>
          </h1>
          <p className="text-xs font-semibold text-indigo-200 mt-1.5 tracking-wide">
            सुरक्षित • तेज़ • 100% ऑफ़लाइन बहीखाता
          </p>
        </motion.div>

        {/* 1.8s Synchronized Progress Bar (Fills completely right before exit) */}
        <div className="w-36 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ delay: 0.25, duration: 1.8, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-sky-300 via-white to-cyan-300 rounded-full"
          />
        </div>
      </div>

      {/* Bottom Creator Tribute */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg">
          <span className="text-xs font-bold text-white tracking-wide">
            Made by Karan with love
          </span>
          <motion.div
            animate={{ scale: [1, 1.35, 1] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
          </motion.div>
        </div>
        <span className="text-[10px] text-indigo-200/80 font-bold tracking-widest uppercase">
          Version 1.0 • High Performance
        </span>
      </motion.div>
    </motion.div>
  );
};
