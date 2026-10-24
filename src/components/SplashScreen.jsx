import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, FastForward } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const SplashScreen = ({ onSkip }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[999999] flex flex-col items-center justify-between py-12 px-6 text-white select-none overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #6d28d9 100%)',
        willChange: 'transform, opacity'
      }}
    >
      {/* Zero-Lag Radial Gradient Orbs (GPU Friendly) */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, transparent 70%)',
          transform: 'translateZ(0)'
        }}
      />
      <div
        className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, transparent 70%)',
          transform: 'translateZ(0)'
        }}
      />

      {/* Top Bar with Badge & Instant Skip Button */}
      <div className="w-full flex items-center justify-between z-10">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold text-blue-100 tracking-wide"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>किराना बहीखाता</span>
        </motion.div>

        {/* Skip Button for Speedrunners */}
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            triggerHaptic('light');
            onSkip();
          }}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/25 text-xs font-extrabold text-white shadow-sm active:scale-90 transition-all cursor-pointer"
        >
          <span>स्किप</span>
          <FastForward className="w-3.5 h-3.5 fill-current" />
        </motion.button>
      </div>

      {/* Center Branding & GPU Animated Scale Bar */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 260, delay: 0.05 }}
          className="relative mb-5"
        >
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-2.5 rounded-[30px] bg-sky-400/30 blur-sm pointer-events-none" />

          <div className="relative w-22 h-22 rounded-3xl bg-white text-indigo-700 font-black text-5xl flex items-center justify-center shadow-2xl border-4 border-white/90">
            <span className="bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
              A
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
            ALTUM<span className="text-sky-300">KHATA</span>
            <span className="px-2 py-0.5 rounded-lg bg-white/20 text-white text-[10px] font-extrabold tracking-wider uppercase">
              PRO
            </span>
          </h1>
          <p className="text-xs font-semibold text-indigo-100 mt-1.5 tracking-wide">
            सुरक्षित • तेज़ • 100% ऑफ़लाइन बहीखाता
          </p>
        </motion.div>

        {/* 2.2s GPU-Composited Progress Line (Using scaleX to eliminate frame drops) */}
        <div className="w-40 h-1 bg-white/20 rounded-full mt-6 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 2.15, ease: [0.25, 1, 0.5, 1] }}
            className="h-full bg-gradient-to-r from-sky-300 via-white to-cyan-300 rounded-full origin-left"
            style={{ willChange: 'transform' }}
          />
        </div>
      </div>

      {/* Bottom Creator Tribute */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="flex flex-col items-center gap-1.5 z-10"
      >
        <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md">
          <span className="text-xs font-bold text-white tracking-wide">
            Made by Karan with love
          </span>
          <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
        </div>
        <span className="text-[10px] text-indigo-200/80 font-bold tracking-widest uppercase">
          Version 1.0 • Lightning Fast
        </span>
      </motion.div>
    </motion.div>
  );
};
