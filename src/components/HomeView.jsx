import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, AlertTriangle, Clock, TrendingUp, TrendingDown, Users, ChevronRight, Heart, MessageCircle } from 'lucide-react';
import { HeroMetricCard } from './HeroMetricCard';
import { ActionCards } from './ActionCards';
import { formatCurrency, sendWhatsAppReminder, openKaranSupportChat } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';

export const HomeView = ({
  shop,
  customers,
  transactions,
  totalReceivables,
  todayCollected,
  onOpenTransaction,
  onOpenAddCustomer,
  onOpenSettings,
  onGoToCustomers,
  onSelectCustomer
}) => {
  const criticalAccounts = customers
    .filter((c) => c.balance > 0 && (c.balance > c.creditLimit || c.balance >= 3000))
    .slice(0, 3);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const custMap = {};
  customers.forEach((c) => { custMap[c.id] = c; });

  return (
    <div className="space-y-4">
      <HeroMetricCard
        totalReceivables={totalReceivables}
        todayCollected={todayCollected}
        activeCount={customers.filter((c) => c.balance > 0).length}
        onShowSummary={onOpenSettings}
      />

      <ActionCards
        onOpenTransaction={onOpenTransaction}
        onOpenAddCustomer={onOpenAddCustomer}
        onOpenSummary={onOpenSettings}
      />

      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          triggerHaptic('light');
          onGoToCustomers();
        }}
        className="glass-card rounded-2xl p-3.5 flex items-center justify-between cursor-pointer border border-blue-100 bg-gradient-to-r from-blue-50/70 to-indigo-50/70"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm">ग्राहक बहीखाता सूची</h4>
            <p className="text-[11px] text-slate-500">
              कुल {customers.length} खाते • {customers.filter((c) => c.balance > 0).length} बाकीदार
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-blue-600">
          <span>खोलें</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>

      {criticalAccounts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>अधिक बाकीदार (तगादा आवश्यक)</span>
            </span>
          </div>

          <div className="space-y-2">
            {criticalAccounts.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c)}
                className="glass-card rounded-2xl p-3 flex items-center justify-between border-l-4 border-l-rose-500 cursor-pointer active:scale-[0.99] transition-all"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-800">{c.name}</span>
                    {c.nickname && (
                      <span className="text-[10px] font-bold text-indigo-600">({c.nickname})</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">{c.village} • सीमा: {formatCurrency(c.creditLimit)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-xs font-black text-rose-600 block">{formatCurrency(c.balance)}</span>
                    <span className="text-[9px] font-bold text-rose-500 uppercase">सीमा पार</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      triggerHaptic('medium');
                      sendWhatsAppReminder({ customer: c, shop, mode: 'firm' });
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200"
                  >
                    तगादा
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Transaction Ledger Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>दुकान ताज़ा हिसाब (Ledger Activity)</span>
          </span>
          <span className="text-[11px] text-slate-400 font-semibold">{recentTransactions.length} प्रविष्टियां</span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center text-slate-400 text-xs font-medium">
            अभी कोई नया लेन-देन दर्ज नहीं हुआ है
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentTransactions.map((tx) => {
              const cust = custMap[tx.customerId];
              const isDiya = tx.type === 'diya';
              return (
                <div
                  key={tx.id}
                  onClick={() => cust && onSelectCustomer(cust)}
                  className="glass-card rounded-2xl p-3 flex items-center justify-between text-xs cursor-pointer active:scale-[0.99] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isDiya ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {isDiya ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-extrabold text-slate-800">{cust?.name || 'अज्ञात'}</span>
                        {cust?.nickname && (
                          <span className="text-[10px] text-indigo-600">({cust.nickname})</span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {tx.tag} {tx.note ? `• ${tx.note}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`font-black text-xs ${isDiya ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDiya ? '-' : '+'} {formatCurrency(tx.amount)}
                    </span>
                    <span className="block text-[9px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtle Karan Watermark & Help Footer */}
      <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-1.5 opacity-80">
        <button
          onClick={() => {
            triggerHaptic('light');
            openKaranSupportChat();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 active:scale-95 transition-all"
        >
          <MessageCircle className="w-3 h-3 fill-emerald-600" />
          <span>Get Help / सहायता: 7054937918</span>
        </button>
        <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
          Made by Karan with love <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
        </span>
      </div>
    </div>
  );
};
