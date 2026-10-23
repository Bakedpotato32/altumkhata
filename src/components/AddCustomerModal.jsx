import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Camera, Calendar } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { compressImage } from '../utils/imageCompressor';
import { GlassDatePicker } from './GlassDatePicker';
import { triggerHaptic } from '../utils/haptics';

export const AddCustomerModal = ({ isOpen, onClose, onAddCustomer }) => {
  const { t } = useLanguage();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [creditLimit, setCreditLimit] = useState('3000');
  const [promiseDate, setPromiseDate] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  if (!isOpen) return null;

  const handlePhotoCapture = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      const base64 = await compressImage(file, 200, 0.7);
      setPhoto(base64);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCustomer({
      name,
      nickname,
      phone,
      village,
      creditLimit: Number(creditLimit) || 3000,
      promiseDate,
      photo
    });

    onClose();
    setName('');
    setNickname('');
    setPhone('');
    setVillage('');
    setPromiseDate('');
    setPhoto(null);
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto no-scrollbar"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <UserPlus className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">{t.addNewCustomer}</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5 mt-3">
            {/* Customer Photo Upload */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
              <label className="relative cursor-pointer">
                <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center overflow-hidden">
                  {photo ? (
                    <img src={photo} alt="Customer" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
              </label>
              <div>
                <span className="text-xs font-bold text-slate-700 block">ग्राहक की फोटो खींचें</span>
                <p className="text-[10px] text-slate-400">रसीद और प्रोफाइल पर दिखेगी (वैकल्पिक)</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">पूरा नाम *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. रमेश पटेल"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">उर्फ़ / उपनाम (Alias)</label>
                <input
                  type="text"
                  placeholder="उदा. मिस्त्री जी / ट्रैक्टर वाले"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">गाँव / मोहल्ला</label>
                <input
                  type="text"
                  placeholder="उदा. पन्ना मोड़"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="tel"
                  placeholder="10 अंक"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.creditLimit}</label>
                <input
                  type="number"
                  placeholder="3000"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Custom Glass Date Picker Trigger (Replaces raw native date picker) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">वादा तारीख (Due Date)</label>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsDatePickerOpen(true);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 active:scale-95 border border-slate-200 text-xs font-semibold flex items-center justify-between text-left transition-all"
                >
                  <span className={promiseDate ? 'text-slate-800 font-bold' : 'text-slate-400'}>
                    {promiseDate || 'तारीख चुनें'}
                  </span>
                  <Calendar className="w-4 h-4 text-blue-600" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 active:scale-95 transition-all mt-2"
            >
              {t.save}
            </button>
          </form>

          {/* Frosted Glass Date Picker Modal */}
          <GlassDatePicker
            isOpen={isDatePickerOpen}
            onClose={() => setIsDatePickerOpen(false)}
            value={promiseDate}
            onChange={setPromiseDate}
            title="उधारी वादा तारीख चुनें"
          />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
