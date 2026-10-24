import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, FileText, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import QRCode from 'qrcode';
import { formatCurrency, getUpiUri, sendDirectWhatsAppInvoice } from '../utils/whatsapp';
import { exportReceiptImageAttachment, exportReceiptPdf } from '../utils/receiptGenerator';
import { GlassDialog } from './GlassDialog';
import { triggerHaptic } from '../utils/haptics';
import { useLanguage } from '../context/LanguageContext';

export const ReceiptModal = ({ isOpen, onClose, customer, shop, transactions }) => {
  const { lang } = useLanguage();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const customerTransactions = transactions.filter((t) => t.customerId === customer?.id);

  // Generate UPI QR Code
  useEffect(() => {
    if (!customer || !shop || !isOpen) return;
    const upiLink = getUpiUri({
      upiId: shop.upiId,
      shopName: shop.shopName,
      amount: customer.balance
    });

    QRCode.toDataURL(upiLink, { width: 180, margin: 1 })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => {});
  }, [customer, shop, isOpen]);

  if (!isOpen || !customer) return null;

  // 1. Direct 1-Tap WhatsApp Invoice
  const handleDirectInvoice = () => {
    triggerHaptic('success');
    sendDirectWhatsAppInvoice({
      customer,
      shop,
      transactions,
      lang
    });
  };

  // 2. Graphical Photo Slip Share
  const handleSharePhoto = async () => {
    setIsExporting(true);
    triggerHaptic('heavy');
    try {
      await exportReceiptImageAttachment({
        canvasElementId: 'virtual-receipt-canvas',
        filename: `${customer.name}_Khata_Slip.png`,
        customer,
        shop,
        lang
      });
    } catch (err) {
      setErrorMessage('फोटो पर्ची शेयर में समस्या: ' + (err.message || 'Error'));
    } finally {
      setIsExporting(false);
    }
  };

  // 3. PDF Export
  const handleExportPdf = async () => {
    setIsExporting(true);
    triggerHaptic('selection');
    try {
      await exportReceiptPdf({
        canvasElementId: 'virtual-receipt-canvas',
        filename: `${customer.name}_Khata_Bill.pdf`,
        customer,
        shop,
        lang
      });
    } catch (err) {
      setErrorMessage('PDF बनाने में समस्या: ' + (err.message || 'Error'));
    } finally {
      setIsExporting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg">दुकान उधार पर्ची</h3>
              <p className="text-xs text-slate-500">
                {customer.name} {customer.nickname ? `(${customer.nickname})` : ''} • {customer.phone || 'मोबाइल नहीं'}
              </p>
            </div>
            <button
              onClick={() => {
                triggerHaptic('selection');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Screen Preview */}
          <div className="p-4 overflow-y-auto space-y-4 no-scrollbar">
            <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase">कुल बाकी रकम</span>
                <h2 className="text-2xl font-black text-rose-600">{formatCurrency(customer.balance)}</h2>
              </div>
              {qrCodeDataUrl && (
                <div className="text-center">
                  <img src={qrCodeDataUrl} alt="UPI QR" className="w-16 h-16 rounded-lg border border-slate-300" />
                  <span className="text-[9px] font-bold text-slate-500 block mt-0.5">UPI QR</span>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-600 mb-2 uppercase">लेन-देन विवरण</h4>
              <div className="space-y-2">
                {customerTransactions.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{tx.tag}</span>
                      <p className="text-[11px] text-slate-400">{new Date(tx.date).toLocaleDateString('hi-IN')}</p>
                      {tx.note && <p className="text-[10px] text-slate-500">{tx.note}</p>}
                    </div>
                    <span className={`font-black text-sm ${tx.type === 'diya' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {tx.type === 'diya' ? '-' : '+'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Hub */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
            {/* Primary Action: 1-Tap Direct WhatsApp Invoice */}
            <button
              onClick={handleDirectInvoice}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>सीधे व्हाट्सएप पर बिल भेजें (1-Tap Direct Invoice)</span>
            </button>

            {/* Secondary Row: Photo Slip & PDF */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleSharePhoto}
                disabled={isExporting}
                className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-extrabold text-xs border border-teal-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-teal-600" />
                <span>{isExporting ? 'बन रहा है...' : 'फोटो पर्ची शेयर'}</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs border border-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>{isExporting ? 'बन रहा है...' : 'PDF रसीद'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* OFFSCREEN 800PX VIRTUAL DESKTOP CANVAS */}
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: '800px', pointerEvents: 'none', zIndex: -999 }}>
          <div
            id="virtual-receipt-canvas"
            style={{
              width: '800px',
              backgroundColor: '#ffffff',
              padding: '40px',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              color: '#0f172a'
            }}
          >
            {/* Header with Shop Logo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #2563eb', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {shop.logo && (
                  <img src={shop.logo} alt="Shop Logo" style={{ width: '70px', height: '70px', borderRadius: '16px', objectFit: 'cover' }} />
                )}
                <div>
                  <h1 style={{ fontSize: '30px', fontWeight: '900', color: '#1e3a8a', margin: 0 }}>
                    {shop.shopName || 'किराना स्टोर'}
                  </h1>
                  <p style={{ margin: '4px 0 0', fontSize: '15px', color: '#64748b' }}>
                    संचालक: {shop.ownerName} | मोबाइल: {shop.phone}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                    {shop.address}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ display: 'inline-block', padding: '6px 14px', backgroundColor: '#eff6ff', color: '#2563eb', borderRadius: '12px', fontSize: '14px', fontWeight: '800' }}>
                  उधार खाता रसीद
                </span>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                  दिनांक: {new Date().toLocaleDateString('hi-IN')}
                </p>
              </div>
            </div>

            {/* Customer Box with Customer Photo */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '24px', borderRadius: '18px', margin: '30px 0', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {customer.photo && (
                  <img src={customer.photo} alt={customer.name} style={{ width: '60px', height: '60px', borderRadius: '14px', objectFit: 'cover' }} />
                )}
                <div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>ग्राहक का नाम</span>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 0', color: '#0f172a' }}>
                    {customer.name} {customer.nickname ? `(${customer.nickname})` : ''}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
                    पता/गाँव: {customer.village} | मोबाइल: {customer.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#dc2626', textTransform: 'uppercase' }}>कुल बाकी राशि (देय)</span>
                <h2 style={{ fontSize: '34px', fontWeight: '900', margin: '4px 0 0', color: '#dc2626' }}>
                  {formatCurrency(customer.balance)}
                </h2>
              </div>
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#475569' }}>तारीख</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#475569' }}>सामान</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#475569' }}>पर्ची नोट</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#475569' }}>रकम (₹)</th>
                </tr>
              </thead>
              <tbody>
                {customerTransactions.map((tx, idx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                    <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(tx.date).toLocaleDateString('hi-IN')}</td>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '700' }}>{tx.tag}</td>
                    <td style={{ padding: '12px', fontSize: '13px', color: '#64748b' }}>{tx.note || '-'}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '15px', fontWeight: '800', color: tx.type === 'diya' ? '#dc2626' : '#16a34a' }}>
                      {tx.type === 'diya' ? '-' : '+'} {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer with UPI QR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px dashed #cbd5e1', paddingTop: '20px' }}>
              <div style={{ maxWidth: '480px' }}>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                  ऑनलाइन भुगतान निर्देश
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  PhonePe, Google Pay, या Paytm से यह QR कोड स्कैन करके सीधे दुकान खाते में भुगतान करें।
                </p>
                <p style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700', color: '#2563eb' }}>
                  UPI ID: {shop.upiId}
                </p>
              </div>

              {qrCodeDataUrl && (
                <div style={{ textAlign: 'center' }}>
                  <img src={qrCodeDataUrl} alt="QR Code" style={{ width: '130px', height: '130px', borderRadius: '12px', border: '1px solid #cbd5e1' }} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>
                    स्कैन करें और पे करें
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Glass Error Dialog */}
        <GlassDialog
          isOpen={Boolean(errorMessage)}
          onClose={() => setErrorMessage(null)}
          title="त्रुटि"
          message={errorMessage}
          type="danger"
        />
      </div>
    </AnimatePresence>,
    document.body
  );
};
