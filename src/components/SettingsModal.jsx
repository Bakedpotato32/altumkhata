import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, Download, Check, Globe, Trash2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GlassDialog } from './GlassDialog';
import { triggerHaptic } from '../utils/haptics';

export const SettingsModal = ({ isOpen, onClose, shop, onUpdateShop, onBackup, onPurgeData }) => {
  const { t, lang, toggleLanguage } = useLanguage();
  const [shopName, setShopName] = useState(shop.shopName);
  const [ownerName, setOwnerName] = useState(shop.ownerName);
  const [phone, setPhone] = useState(shop.phone);
  const [upiId, setUpiId] = useState(shop.upiId);

  // Custom Glass Dialog states
  const [showPurgeConfirm, setShowPurgeConfirm] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateShop({ shopName, ownerName, phone, upiId });
    onClose();
  };

  const handleExecutePurge = () => {
    setShowPurgeConfirm(false);
    onPurgeData();
    setShowSuccessDialog(true);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-extrabold text-slate-800">{t.dukaanProfile}</h3>
            </div>
            <button
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.shopName}</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.ownerName}</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.upiId}</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
            >
              {t.save}
            </button>
          </form>

          {/* Tools & Reset Options */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                triggerHaptic('medium');
                toggleLanguage();
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-between active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                भाषा / Language
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px]">
                {lang === 'hi' ? 'हिन्दी' : 'English'}
              </span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('heavy');
                onBackup();
              }}
              className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between border border-emerald-200 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                {t.backupData}
              </span>
              <span className="text-[10px] text-emerald-600">सुरक्षित JSON</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('heavy');
                setShowPurgeConfirm(true);
              }}
              className="w-full py-2 px-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold flex items-center justify-between border border-rose-200 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-600" />
                {t.clearSampleData}
              </span>
              <span className="text-[10px] text-rose-600">रीसेट</span>
            </button>
          </div>
        </motion.div>

        {/* Custom Frosted Confirmation Dialog */}
        <GlassDialog
          isOpen={showPurgeConfirm}
          onClose={() => setShowPurgeConfirm(false)}
          onConfirm={handleExecutePurge}
          title="सैंपल डेटा हटाएं?"
          message="क्या आप सभी ग्राहक खाते और लेन-देन साफ़ करना चाहते हैं? यह क्रिया वापस नहीं होगी।"
          confirmText="हाँ, साफ़ करें"
          cancelText="रद्द करें"
          type="danger"
        />

        {/* Custom Frosted Success Dialog */}
        <GlassDialog
          isOpen={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            onClose();
          }}
          title="सफलता"
          message={t.clearSampleSuccess}
          confirmText="ठीक है"
          type="success"
        />
      </div>
    </AnimatePresence>,
    document.body
  );
};
