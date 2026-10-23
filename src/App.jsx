import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, UserPlus, Users } from 'lucide-react';
import { useKhata } from './context/KhataContext';
import { useLanguage } from './context/LanguageContext';
import { OnboardingModal } from './components/OnboardingModal';
import { HeroMetricCard } from './components/HeroMetricCard';
import { ActionCards } from './components/ActionCards';
import { CustomerCard } from './components/CustomerCard';
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

  const { t, lang, toggleLanguage } = useLanguage();

  const [currentTab, setTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Modals state
  const [txModal, setTxModal] = useState({ isOpen: false, type: 'diya' });
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activePassbookCustomer, setActivePassbookCustomer] = useState(null);
  const [receiptCustomer, setReceiptCustomer] = useState(null);
  const [dialogNotice, setDialogNotice] = useState(null);

  // Filter customers based on search and selected filter
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.nickname && c.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery));

    if (!matchesSearch) return false;
    if (filterType === 'due') return c.balance > 0;
    if (filterType === 'settled') return c.balance <= 0;
    return true;
  });

  return (
    <div className="min-h-screen relative pb-28 pt-3 px-4 max-w-md mx-auto">
      {/* First-Launch Onboarding Wizard */}
      <OnboardingModal
        isOpen={!shop.isConfigured}
        onComplete={setupShop}
      />

      {/* Background Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-20">
        <div className="absolute top-10 left-5 w-64 h-64 rounded-full bg-blue-200/40 blur-3xl animate-blob-1" />
        <div className="absolute top-80 right-2 w-72 h-72 rounded-full bg-indigo-200/40 blur-3xl animate-blob-2" />
        <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl animate-blob-1" />
      </div>

      {/* Header Bar */}
      <div className="flex items-center justify-between py-2 mb-4">
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

        {/* Right Buttons: '+ New Customer' Pill & Language Toggle */}
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

      {/* Hero Metric Card */}
      <HeroMetricCard
        totalReceivables={totalReceivables}
        todayCollected={todayCollected}
        activeCount={customers.filter((c) => c.balance > 0).length}
        onShowSummary={() => setIsSettingsOpen(true)}
      />

      {/* Action Cards (Diya / Liya) */}
      <ActionCards
        onOpenTransaction={(type) => {
          if (customers.length === 0) {
            setDialogNotice({
              title: 'कोई ग्राहक नहीं मिला',
              message: 'हिसाब दर्ज करने से पहले "+ ग्राहक" बटन दबाकर कम से कम एक खाता जोड़ें।',
              action: () => setIsAddCustomerOpen(true)
            });
            return;
          }
          setTxModal({ isOpen: true, type });
        }}
        onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
        onOpenSummary={() => setIsSettingsOpen(true)}
      />

      {/* Search & Filters */}
      {customers.length > 0 && (
        <div className="my-4 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-card text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'due', label: t.filterDue },
              { id: 'settled', label: t.filterSettled }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  triggerHaptic('selection');
                  setFilterType(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === f.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'glass-card text-slate-600 hover:bg-white/90'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer Ledger Cards */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t.recentTransactions}
          </h3>
          <span className="text-xs font-semibold text-slate-400">
            {filteredCustomers.length} खाते
          </span>
        </div>

        {customers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-6 glass-card rounded-3xl border border-white/80 my-4"
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">{t.noCustomers}</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              {t.noCustomersDesc}
            </p>
            <button
              onClick={() => {
                triggerHaptic('medium');
                setIsAddCustomerOpen(true);
              }}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 active:scale-95 inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>पहला ग्राहक जोड़ें</span>
            </button>
          </motion.div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 glass-card rounded-3xl">
            <p className="text-xs font-bold text-slate-500">कोई मिलता-जुलता ग्राहक नहीं मिला।</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              shop={shop}
              onSelectCustomer={(c) => setActivePassbookCustomer(c)}
              onOpenReceipt={(c) => setReceiptCustomer(c)}
            />
          ))
        )}
      </div>

      {/* Bottom Floating Glass Dock */}
      <GlassDock
        currentTab={currentTab}
        setTab={(tab) => {
          if (tab === 'settings') setIsSettingsOpen(true);
          else if (tab === 'customers') setFilterType('due');
          else setFilterType('all');
          setTab(tab);
        }}
        onQuickAdd={() => {
          if (customers.length === 0) {
            setIsAddCustomerOpen(true);
            return;
          }
          setTxModal({ isOpen: true, type: 'diya' });
        }}
      />

      {/* Modals & Portals */}
      <TransactionModal
        isOpen={txModal.isOpen}
        onClose={() => setTxModal({ isOpen: false, type: 'diya' })}
        type={txModal.type}
        customers={customers}
        onAddTransaction={addTransaction}
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

      {/* App Notice Glass Dialog */}
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
