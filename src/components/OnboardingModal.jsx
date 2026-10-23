import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Camera, Sparkles, Check, Phone, MapPin, QrCode } from 'lucide-react';
import { compressImage } from '../utils/imageCompressor';
import { triggerHaptic } from '../utils/haptics';

export const OnboardingModal = ({ isOpen, onComplete }) => {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [address, setAddress] = useState('');
  const [logo, setLogo] = useState(null);

  if (!isOpen) return null;

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('light');
      const base64 = await compressImage(file, 200, 0.7);
      setLogo(base64);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!shopName.trim() || !phone.trim()) return;

    triggerHaptic('success');
    onComplete({
      shopName: shopName.trim(),
      ownerName: ownerName.trim() || 'दुकानदार',
      phone: phone.trim(),
      upiId: upiId.trim(),
      address: address.trim() || 'बाज़ार',
      logo
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-white/80 my-auto"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">दुकान सेटअप</h2>
          <p className="text-xs text-slate-500 mt-1">
            अपने डिजिटल किराना बहीखाता की जानकारी दर्ज करें
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Logo / Shop Front Photo */}
          <div className="flex items-center justify-center mb-2">
            <label className="relative cursor-pointer group">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-600">
                {logo ? (
                  <img src={logo} alt="Shop Logo" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-[10px] font-bold text-blue-600">लोगो / फ़ोटो</span>
                  </>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">दुकान का नाम *</label>
            <input
              type="text"
              required
              placeholder="उदा. श्री राम किराना एवं जनरल स्टोर"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-sm font-semibold outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">संचालक का नाम</label>
              <input
                type="text"
                placeholder="उदा. राजेश चौरसिया"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">मोबाइल नंबर *</label>
              <input
                type="tel"
                required
                placeholder="10 अंक"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              दुकान की UPI ID (QR रसीद के लिए)
            </label>
            <div className="relative">
              <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="उदा. 9876543210@upi या shop@okaxis"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">दुकान का पूरा पता</label>
            <input
              type="text"
              placeholder="उदा. मेन चौराहा, पोस्ट ऑफिस के सामने, पन्ना"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            <span>दुकान बहीखाता शुरू करें</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
