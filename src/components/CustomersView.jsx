import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, UserPlus, Filter, ArrowUpDown, MapPin, Users } from 'lucide-react';
import { CustomerCard } from './CustomerCard';
import { useLanguage } from '../context/LanguageContext';
import { formatCurrency } from '../utils/whatsapp';
import { triggerHaptic } from '../utils/haptics';

export const CustomersView = ({
  shop,
  customers,
  onSelectCustomer,
  onOpenReceipt,
  onOpenAddCustomer
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dues_high');

  const uniqueVillages = useMemo(() => {
    const set = new Set();
    customers.forEach((c) => {
      if (c.village && c.village.trim()) set.add(c.village.trim());
    });
    return Array.from(set);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.nickname && c.nickname.toLowerCase().includes(q)) ||
        c.village.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q));

      if (!matchesSearch) return false;
      if (selectedVillage !== 'all' && c.village !== selectedVillage) return false;
      if (statusFilter === 'due' && c.balance <= 0) return false;
      if (statusFilter === 'settled' && c.balance > 0) return false;

      return true;
    });

    return result.sort((a, b) => {
      if (sortBy === 'dues_high') return b.balance - a.balance;
      if (sortBy === 'dues_low') return a.balance - b.balance;
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'hi');
      if (sortBy === 'recent') {
        const dateA = a.lastTxDate ? new Date(a.lastTxDate) : new Date(a.createdAt);
        const dateB = b.lastTxDate ? new Date(b.lastTxDate) : new Date(b.createdAt);
        return dateB - dateA;
      }
      return 0;
    });
  }, [customers, searchQuery, selectedVillage, statusFilter, sortBy]);

  const totalFilteredDues = useMemo(() => {
    return filteredCustomers.reduce((acc, c) => acc + Math.max(0, c.balance), 0);
  }, [filteredCustomers]);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">ग्राहक बहीखाता</h2>
          <p className="text-xs text-slate-500 font-medium">कुल {customers.length} ग्राहक पंजीकृत हैं</p>
        </div>

        <button
          onClick={() => {
            triggerHaptic('medium');
            onOpenAddCustomer();
          }}
          className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ नया खाता</span>
        </button>
      </div>

      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ग्राहक का नाम, उपनाम (उर्फ़), गाँव या फोन..."
          className="w-full pl-12 pr-10 py-3.5 rounded-2xl glass-card text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 shadow-md shadow-blue-500/5 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => {
              triggerHaptic('light');
              setSearchQuery('');
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-200/80 flex items-center justify-center text-slate-600 active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'सभी खाते' },
            { id: 'due', label: 'केवल बाकीदार' },
            { id: 'settled', label: 'हिसाब चुकता' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                triggerHaptic('selection');
                setStatusFilter(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === item.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                  : 'glass-card text-slate-600 hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {uniqueVillages.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5 pl-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>गाँव:</span>
            </span>
            <button
              onClick={() => {
                triggerHaptic('selection');
                setSelectedVillage('all');
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedVillage === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              सभी गाँव
            </button>
            {uniqueVillages.map((v) => (
              <button
                key={v}
                onClick={() => {
                  triggerHaptic('selection');
                  setSelectedVillage(v);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                  selectedVillage === v
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-slate-500 font-bold border-y border-slate-100 py-2">
        <span>
          {filteredCustomers.length} खाते • कुल बाकी: <strong className="text-rose-600 font-black">{formatCurrency(totalFilteredDues)}</strong>
        </span>

        <select
          value={sortBy}
          onChange={(e) => {
            triggerHaptic('selection');
            setSortBy(e.target.value);
          }}
          className="bg-slate-100 text-slate-700 font-bold text-[11px] py-1 px-2 rounded-lg outline-none border border-slate-200"
        >
          <option value="dues_high">बाकी: ज़्यादा से कम</option>
          <option value="dues_low">बाकी: कम से ज़्यादा</option>
          <option value="recent">हालिया लेन-देन</option>
          <option value="name">नाम अनुसार (A-Z)</option>
        </select>
      </div>

      <div>
        {customers.length === 0 ? (
          <div className="text-center py-12 px-6 glass-card rounded-3xl my-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-base">{t.noCustomers}</h4>
            <p className="text-xs text-slate-500 mt-1">{t.noCustomersDesc}</p>
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenAddCustomer();
              }}
              className="mt-4 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>पहला ग्राहक जोड़ें</span>
            </button>
          </div>
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
              onSelectCustomer={onSelectCustomer}
              onOpenReceipt={onOpenReceipt}
            />
          ))
        )}
      </div>
    </div>
  );
};
