import React from 'react';
import { motion } from 'framer-motion';
import { Home, Users, Plus, SlidersHorizontal } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export const GlassDock = ({ currentTab, setTab, onQuickAdd }) => {
  const tabs = [
    { id: 'home', label: 'दुकान', icon: Home },
    { id: 'customers', label: 'ग्राहक', icon: Users },
    { id: 'add', label: 'नया हिसाब', icon: Plus, isAction: true },
    { id: 'settings', label: 'सेटिंग्स', icon: SlidersHorizontal }
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] w-11/12 max-w-sm">
      <div className="glass-dock rounded-full px-3 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isAction) {
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  triggerHaptic('medium');
                  onQuickAdd();
                }}
                className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-white"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </motion.button>
            );
          }

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                triggerHaptic('selection');
                setTab(tab.id);
              }}
              className="relative px-3 py-1 flex flex-col items-center justify-center"
            >
              {isActive && (
                <motion.div
                  layoutId="dock-pill"
                  className="absolute inset-0 bg-blue-50/80 rounded-2xl -z-10"
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                />
              )}
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {tab.label}
              </span>
              {isActive && <span className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
