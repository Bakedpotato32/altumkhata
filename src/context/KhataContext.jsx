import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { triggerHaptic } from '../utils/haptics';

const INITIAL_SHOP = {
  isConfigured: false,
  shopName: '',
  ownerName: '',
  phone: '',
  upiId: '',
  address: '',
  logo: null
};

// Completely empty seed data for a clean production app
const INITIAL_CUSTOMERS = [];
const INITIAL_TRANSACTIONS = [];

const KhataContext = createContext();

export const KhataProvider = ({ children }) => {
  const [shop, setShop] = useState(() => {
    const saved = localStorage.getItem('altum_shop');
    return saved ? JSON.parse(saved) : INITIAL_SHOP;
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('altum_customers');
    if (!saved) return INITIAL_CUSTOMERS;
    try {
      const parsed = JSON.parse(saved);
      // Automatically purge legacy sample profiles if still present
      const cleaned = parsed.filter(c => !['cust-1', 'cust-2', 'cust-3'].includes(c.id));
      return cleaned;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('altum_transactions');
    if (!saved) return INITIAL_TRANSACTIONS;
    try {
      const parsed = JSON.parse(saved);
      // Automatically purge legacy sample transactions if still present
      const cleaned = parsed.filter(t => !['tx-1', 'tx-2', 'tx-3', 'tx-4', 'tx-5'].includes(t.id));
      return cleaned;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  useEffect(() => {
    localStorage.setItem('altum_shop', JSON.stringify(shop));
  }, [shop]);

  useEffect(() => {
    localStorage.setItem('altum_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('altum_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Aggregate live customer balances & totals
  const customerMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      map[c.id] = { ...c, balance: 0, totalDiya: 0, totalLiya: 0, lastTxDate: null };
    });

    transactions.forEach((tx) => {
      if (!map[tx.customerId]) return;
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'diya') {
        map[tx.customerId].balance += amt;
        map[tx.customerId].totalDiya += amt;
      } else {
        map[tx.customerId].balance -= amt;
        map[tx.customerId].totalLiya += amt;
      }
      if (!map[tx.customerId].lastTxDate || new Date(tx.date) > new Date(map[tx.customerId].lastTxDate)) {
        map[tx.customerId].lastTxDate = tx.date;
      }
    });

    return map;
  }, [customers, transactions]);

  const customerListWithBalance = useMemo(() => {
    return Object.values(customerMap).sort((a, b) => b.balance - a.balance);
  }, [customerMap]);

  const totalReceivables = useMemo(() => {
    return customerListWithBalance.reduce((acc, curr) => acc + Math.max(0, curr.balance), 0);
  }, [customerListWithBalance]);

  const todayCollected = useMemo(() => {
    const todayStr = new Date().toDateString();
    return transactions
      .filter((tx) => tx.type === 'liya' && new Date(tx.date).toDateString() === todayStr)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [transactions]);

  const addCustomer = ({ name, nickname, phone, village, creditLimit, photo, promiseDate }) => {
    const newCust = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      nickname: (nickname || '').trim(),
      phone: (phone || '').trim(),
      village: (village || 'गाँव').trim(),
      creditLimit: Number(creditLimit) || 3000,
      photo: photo || null,
      promiseDate: promiseDate || '',
      createdAt: new Date().toISOString()
    };
    setCustomers((prev) => [newCust, ...prev]);
    triggerHaptic('success');
    return newCust;
  };

  // Delete Customer & Cascade delete all their transactions
  const deleteCustomer = (customerId) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    setTransactions((prev) => prev.filter((t) => t.customerId !== customerId));
    triggerHaptic('heavy');
  };

  const addTransaction = ({ customerId, type, amount, tag, note }) => {
    const newTx = {
      id: `tx-${Date.now()}`,
      customerId,
      type,
      amount: Math.abs(Number(amount)),
      tag: tag || (type === 'diya' ? 'राशन' : 'जमा'),
      note: (note || '').trim(),
      date: new Date().toISOString()
    };
    setTransactions((prev) => [newTx, ...prev]);
    triggerHaptic(type === 'liya' ? 'success' : 'medium');
    return newTx;
  };

  const settleCustomerAccount = (customerId) => {
    const cust = customerMap[customerId];
    if (!cust || cust.balance <= 0) return;

    addTransaction({
      customerId,
      type: 'liya',
      amount: cust.balance,
      tag: 'पूरा चुकता',
      note: 'खाता पूरा चुकता किया गया'
    });
    triggerHaptic('success');
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    triggerHaptic('selection');
  };

  const setupShop = (details) => {
    setShop({
      ...details,
      isConfigured: true
    });
    triggerHaptic('success');
  };

  // Clean wipe of all data (including local storage)
  const purgeAllData = () => {
    localStorage.removeItem('altum_customers');
    localStorage.removeItem('altum_transactions');
    setCustomers([]);
    setTransactions([]);
    triggerHaptic('success');
  };

  const backupData = () => {
    const data = JSON.stringify({ shop, customers, transactions }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AltumKhata_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerHaptic('success');
  };

  return (
    <KhataContext.Provider
      value={{
        shop,
        customers: customerListWithBalance,
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
      }}
    >
      {children}
    </KhataContext.Provider>
  );
};

export const useKhata = () => useContext(KhataContext);
