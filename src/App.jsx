import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useKhata } from './context/KhataContext';
import { useLanguage } from './context/LanguageContext';
import { SplashScreen } from './components/SplashScreen';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeView } from './components/HomeView';
import { CustomersView } from './components/CustomersView';
import { CustomerPassbookModal } from './components/CustomerPassbookModal';
import { TransactionModal } from './components/TransactionModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SettingsModal } from './components/SettingsModal';
import { GlassDock } from './components/GlassDock';
import { GlassDialog } from './components/GlassDialog';
import { triggerHaptic } from './utils/haptics';

export function App() {
  const {
    shop,
    customers,
    transactions,
    totalReceivables,
    todayCollected,
    setupShop,
    addCustomer,
    deleteCustomer,
    addTransaction,
    settleCustomerAccount,
    deleteTransaction,
    purgeAllData,
    backupData
  } = useKhata();

  const { lang, toggleLanguage } = useLanguage();

  // Splash Screen State (1.8s timer)
  const [showSplash, setShowSplash] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const [currentTab, setTab] = useState('home');

  // Modals state
  const [txModal, setTxModal] = useState({ isOpen: false, type: 'diya', preSelectedCustomerId: null });
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePassbookCustomer, setActivePassbookCustomer] = useState(null);
  const [receiptCustomer, setReceiptCustomer] = useState(null);
  const [dialogNotice, setDialogNotice] = useState(null);

  const handleOpenTransaction = (type, custId = null) => {
    if (customers.length === 0) {
      setDialogNotice({
        title: 'कोई ग्राहक नहीं मिला',
        message: 'हिसाब लिखने से पहले "+ ग्राहक" बटन दबाकर कम से कम एक खाता जोड़ें।',
        action: () => setIsAddCustomerOpen(true)
      });
      return;
    }
    setTxModal({ isOpen: true, type, preSelectedCustomerId: custId });
  };

  return (
    <div className="min-h-screen relative pb-28 pt-3 px-4 max-w-md mx-auto">
      {/* Animated Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen />}
      </AnimatePresence>

      {/* Onboarding Wizard */}
      <OnboardingModal
        isOpen={!shop.isConfigured}
        onComplete={setupShop}
      />

      {/* Floating Ambient Glow Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute top-10 left-5 w-64 h-64 rounded-full bg-blue-200/40 blur-3xl animate-blob-1" />
        <div className="absolute top-80 right-2 w-72 h-72 rounded-full bg-indigo-200/40 blur-3xl animate-blob-2" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl animate-blob-1" />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between py-2 mb-3">
        <div className="flex items-center gap-2.5">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt="Logo"
              className="w-10 h-10 rounded-2xl object-cover shadow-md shadow-indigo-500/20 border border-white"
            />
          ) : (
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-500/25">
              A
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                ALTUM<span className="text-blue-600">KHATA</span>
              </h1>
              <span className="px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-extrabold tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 truncate max-w-[170px]">
              {shop.shopName || 'किराना बहीखाता'}
            </p>
          </div>
        </div>

        {/* Right Header Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              triggerHaptic('medium');
              setIsAddCustomerOpen(true);
            }}
            className="px-3.5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white text-xs font-bold shadow-lg shadow-rose-500/25 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>+ ग्राहक</span>
          </motion.button>

          <button
            onClick={() => {
              triggerHaptic('selection');
              toggleLanguage();
            }}
            className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-slate-700 active:scale-95 font-bold text-xs"
          >
            {lang === 'hi' ? 'EN' : 'हि'}
          </button>
        </div>
      </div>

      {/* Screen Views */}
      {currentTab === 'home' ? (
        <HomeView
          shop={shop}
          customers={customers}
          transactions={transactions}
          totalReceivables={totalReceivables}
          todayCollected={todayCollected}
          onOpenTransaction={(type) => handleOpenTransaction(type)}
          onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onGoToCustomers={() => setTab('customers')}
          onSelectCustomer={(c) => setActivePassbookCustomer(c)}
        />
      ) : (
        <CustomersView
          shop={shop}
          customers={customers}
          onSelectCustomer={(c) => setActivePassbookCustomer(c)}
          onOpenReceipt={(c) => setReceiptCustomer(c)}
          onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
        />
      )}

      {/* Floating Glass Dock */}
      <GlassDock
        currentTab={currentTab}
        setTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setTab(tab);
          }
        }}
        onQuickAdd={() => handleOpenTransaction('diya')}
      />

      {/* Modals & Portals */}
      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal({ isOpen: false, type: 'diya', preSelectedCustomerId: null })}
        type={txModal.type}
        customers={customers}
        preSelectedCustomerId={txModal.preSelectedCustomerId}
        onAddTransaction={addTransaction}
        onOpenAddCustomer={() => {
          setTxModal({ isOpen: false, type: 'diya', preSelectedCustomerId: null });
          setIsAddCustomerOpen(true);
        }}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onAddCustomer={addCustomer}
      />

      <CustomerPassbookModal
        isOpen={Boolean(activePassbookCustomer)}
        onClose={() => setActivePassbookCustomer(null)}
        customer={activePassbookCustomer}
        shop={shop}
        transactions={transactions}
        onSettleAll={settleCustomerAccount}
        onDeleteTransaction={deleteTransaction}
        onDeleteCustomer={deleteCustomer}
        onOpenReceipt={(c) => {
          setActivePassbookCustomer(null);
          setReceiptCustomer(c);
        }}
      />

      <ReceiptModal
        isOpen={Boolean(receiptCustomer)}
        onClose={() => setReceiptCustomer(null)}
        customer={receiptCustomer}
        shop={shop}
        transactions={transactions}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        shop={shop}
        onUpdateShop={setupShop}
        onBackup={backupData}
        onPurgeData={purgeAllData}
      />

      {/* Notice Dialog */}
      <GlassDialog
        isOpen={Boolean(dialogNotice)}
        onClose={() => setDialogNotice(null)}
        onConfirm={() => {
          if (dialogNotice?.action) dialogNotice.action();
          setDialogNotice(null);
        }}
        title={dialogNotice?.title}
        message={dialogNotice?.message}
        confirmText="नया ग्राहक जोड़ें"
        cancelText="बंद करें"
        type="info"
      />
    </div>
  );
}
