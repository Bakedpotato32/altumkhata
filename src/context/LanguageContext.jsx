import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  hi: {
    appTitle: 'AltumKhata',
    appSubtitle: 'डिजिटल किराना बहीखाता',
    heroBadge: 'दुकान स्थिति • सक्रिय',
    totalReceivables: 'कुल बाज़ार बाकी (लेना है)',
    todayCollected: 'आज का जमा मिला',
    netActiveCustomers: 'सक्रिय खातेदार',
    quickActions: 'त्वरित बहीखाता',
    giveCredit: 'उधार दिया (नामे)',
    receivePayment: 'जमा मिला (जमा)',
    addNewCustomer: 'नया ग्राहक जोड़ें',
    reports: 'दुकान हिसाब पर्ची',
    searchPlaceholder: 'ग्राहक का नाम, उर्फ़ या मोहल्ला खोजें...',
    village: 'गाँव / मोहल्ला',
    phone: 'मोबाइल नंबर',
    creditLimit: 'उधार सीमा (लिमिट)',
    save: 'सुरक्षित करें',
    cancel: 'रद्द करें',
    amount: 'रकम (₹)',
    itemTag: 'सामान विवरण',
    addNote: 'अतिरिक्त पर्ची नोट (वैकल्पिक)',
    quickChips: 'त्वरित रकम चुनाव',
    confirmEntry: 'खाते में जोड़ें',
    whatsappReminder: 'व्हाट्सएप तगादा',
    callNow: 'सीधे कॉल करें',
    sendBill: 'विस्तृत पर्ची (रसीद)',
    noCustomers: 'अभी कोई ग्राहक खाता नहीं है।',
    noCustomersDesc: 'ऊपर दिए गए "+ ग्राहक" बटन पर दबाकर अपना पहला खाता जोड़ें।',
    recentTransactions: 'ताज़ा लेन-देन',
    filterAll: 'सभी',
    filterDue: 'केवल बाकीदार',
    filterSettled: 'हिसाब चुकता',
    dukaanProfile: 'दुकान प्रोफाइल',
    shopName: 'दुकान का नाम',
    ownerName: 'दुकानदार का नाम',
    upiId: 'दुकान की UPI ID (QR के लिए)',
    backupData: 'डाटा बैकअप (JSON)',
    restoreData: 'डाटा रिस्टोर',
    allSettledNotice: 'बहुत बढ़िया! कोई बाकीदार नहीं है।',
    date: 'तारीख',
    totalBalance: 'कुल बाकी',
    paidInFull: 'हिसाब चुकता',
    dueWarning: 'सीमा से अधिक',
    deleteCustomer: 'ग्राहक खाता हटाएं',
    confirmDeleteCust: 'क्या आप वाकई इस ग्राहक का खाता और सारा पुराना हिसाब हटाना चाहते हैं?',
    dueDeleteWarning: 'चेतावनी: इस ग्राहक पर अभी भी बाकी राशि है! खाता हटाने पर यह हिसाब मिट जाएगा।',
    clearSampleData: 'सैंपल डेटा हटाएं (नया खाता)',
    clearSampleSuccess: 'सभी सैंपल रिकॉर्ड हटा दिए गए हैं। आपका बहीखाता अब एकदम नया है।'
  },
  en: {
    appTitle: 'AltumKhata',
    appSubtitle: 'Kirana Credit Ledger',
    heroBadge: 'STORE STATUS • ACTIVE',
    totalReceivables: 'Total Market Dues (Receivable)',
    todayCollected: "Today's Collection",
    netActiveCustomers: 'Active Accounts',
    quickActions: 'Quick Actions',
    giveCredit: 'Gave Credit (Debit)',
    receivePayment: 'Received (Credit)',
    addNewCustomer: 'Add Customer',
    reports: 'Store Summary',
    searchPlaceholder: 'Search customer, alias, or village...',
    village: 'Village / Ward',
    phone: 'Phone Number',
    creditLimit: 'Credit Limit (₹)',
    save: 'Save',
    cancel: 'Cancel',
    amount: 'Amount (₹)',
    itemTag: 'Item Category',
    addNote: 'Bill Note (Optional)',
    quickChips: 'Quick Amounts',
    confirmEntry: 'Record Transaction',
    whatsappReminder: 'WhatsApp Reminder',
    callNow: 'Call Direct',
    sendBill: 'Detailed Bill Slip',
    noCustomers: 'No customer accounts yet.',
    noCustomersDesc: 'Tap the "+ ग्राहक" button above to create your first customer account.',
    recentTransactions: 'Recent Ledger Entries',
    filterAll: 'All Accounts',
    filterDue: 'Due Accounts',
    filterSettled: 'Settled',
    dukaanProfile: 'Store Profile',
    shopName: 'Store Name',
    ownerName: 'Proprietor Name',
    upiId: 'Store UPI ID (For QR Code)',
    backupData: 'Export Backup (JSON)',
    restoreData: 'Restore Backup',
    allSettledNotice: 'Great! All balances are fully cleared.',
    date: 'Date',
    totalBalance: 'Net Balance',
    paidInFull: 'Settled',
    dueWarning: 'Over Limit',
    deleteCustomer: 'Delete Customer Account',
    confirmDeleteCust: 'Are you sure you want to delete this customer account and all transactions?',
    dueDeleteWarning: 'Warning: This customer still has pending dues! Deleting will permanently remove their records.',
    clearSampleData: 'Purge Sample / Demo Data',
    clearSampleSuccess: 'All demo records have been cleared. Your ledger is clean.'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('altum_lang') || 'hi');

  useEffect(() => {
    localStorage.setItem('altum_lang', lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const t = translations[lang] || translations.hi;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
