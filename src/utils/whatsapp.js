export const formatCurrency = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val || 0);
};

export const getUpiUri = ({ upiId, shopName, amount }) => {
  const cleanUpi = (upiId || '').trim();
  const cleanName = encodeURIComponent(shopName || 'Kirana Store');
  const validAmount = Math.max(0, Number(amount) || 0);
  return `upi://pay?pa=${cleanUpi}&pn=${cleanName}&am=${validAmount}&cu=INR`;
};

/**
 * 1-Tap Get Help to Karan's Direct WhatsApp (7054937918)
 */
export const openKaranSupportChat = () => {
  const message = encodeURIComponent(
    "🙏 नमस्ते करण जी!\nमुझे AltumKhata ऐप के संबंध में सहायता / जानकारी चाहिए।"
  );
  window.open(`https://api.whatsapp.com/send?phone=917054937918&text=${message}`, '_blank');
};

/**
 * Builds formatted digital invoice for 1-tap direct chat delivery
 */
export const buildItemizedWhatsAppBill = ({ customer, shop, transactions = [], lang = 'hi' }) => {
  const balance = customer.balance;
  const greeting = customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name;
  const custTxs = transactions
    .filter((t) => t.customerId === customer.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const upiLink = shop.upiId ? getUpiUri({
    upiId: shop.upiId,
    shopName: shop.shopName,
    amount: balance
  }) : '';

  const todayStr = new Date().toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (lang === 'hi') {
    let bill = `🧾 *${shop.shopName || 'किराना स्टोर'}*\n`;
    if (shop.address) bill += `📍 ${shop.address}\n`;
    bill += `📞 ${shop.phone || ''}\n`;
    bill += `─────────────────────\n`;
    bill += `👤 *ग्राहक:* ${greeting}\n`;
    bill += `📅 *दिनांक:* ${todayStr}\n`;
    bill += `─────────────────────\n`;
    bill += `*हालिया हिसाब विवरण:*\n`;

    if (custTxs.length === 0) {
      bill += `• पुराना बकाया हिसाब\n`;
    } else {
      custTxs.forEach((tx) => {
        const txDate = new Date(tx.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' });
        const sign = tx.type === 'diya' ? '(-) ' : '(+) ';
        bill += `• ${txDate}: ${tx.tag} ${sign}${formatCurrency(tx.amount)}\n`;
        if (tx.note) bill += `   _${tx.note}_\n`;
      });
    }

    bill += `─────────────────────\n`;
    bill += `🔴 *कुल देय बाकी (Balance): ${formatCurrency(balance)}*\n`;
    bill += `─────────────────────\n`;

    if (upiLink) {
      bill += `\n💳 *ऑनलाइन UPI से तुरंत भुगतान करें:*\n${upiLink}\n`;
    }

    bill += `\n🙏 *समय पर भुगतान कर खाता व्यवस्थित रखें।*\n_दुकानदार: ${shop.ownerName || ''}_\n\n_AltumKhata • Made by Karan with love 💕_`;
    return bill;
  }

  let bill = `🧾 *${shop.shopName || 'Store Receipt'}*\n`;
  if (shop.address) bill += `📍 ${shop.address}\n`;
  bill += `📞 ${shop.phone || ''}\n`;
  bill += `─────────────────────\n`;
  bill += `👤 *Customer:* ${greeting}\n`;
  bill += `📅 *Date:* ${todayStr}\n`;
  bill += `─────────────────────\n`;
  bill += `*Recent Transactions:*\n`;

  if (custTxs.length === 0) {
    bill += `• Opening Dues\n`;
  } else {
    custTxs.forEach((tx) => {
      const txDate = new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      const sign = tx.type === 'diya' ? '(-) ' : '(+) ';
      bill += `• ${txDate}: ${tx.tag} ${sign}${formatCurrency(tx.amount)}\n`;
      if (tx.note) bill += `   _${tx.note}_\n`;
    });
  }

  bill += `─────────────────────\n`;
  bill += `🔴 *Total Balance Due: ${formatCurrency(balance)}*\n`;
  bill += `─────────────────────\n`;

  if (upiLink) {
    bill += `\n💳 *Pay instantly via UPI:*\n${upiLink}\n`;
  }

  bill += `\n🙏 *Kindly settle the dues at your earliest convenience.*\n_Owner: ${shop.ownerName || ''}_\n\n_AltumKhata • Made by Karan with love 💕_`;
  return bill;
};

export const sendDirectWhatsAppInvoice = ({ customer, shop, transactions = [], lang = 'hi' }) => {
  const phone = (customer.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const message = buildItemizedWhatsAppBill({ customer, shop, transactions, lang });
  const encodedMsg = encodeURIComponent(message);

  const waUrl = formattedPhone
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, '_blank');
};

export const sendWhatsAppReminder = ({ customer, shop, mode = 'polite', lang = 'hi' }) => {
  const balance = customer.balance;
  if (balance <= 0) return;

  const phone = (customer.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;
  const greeting = customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name;

  const upiLink = shop.upiId ? getUpiUri({
    upiId: shop.upiId,
    shopName: shop.shopName,
    amount: balance
  }) : '';

  let message = '';
  if (mode === 'firm') {
    message = `⚠️ *महत्वपूर्ण सूचना - बकाया हिसाब*\n\n` +
      `श्रीमान *${greeting} जी*,\n` +
      `*${shop.shopName || 'किराना स्टोर'}* पर आपका कुल बाकी *${formatCurrency(balance)}* काफी समय से लंबित है।\n\n` +
      `कृपया आज ही भुगतान कर खाता व्यवस्थित करें ताकि भविष्य की उधारी सेवा बाधित न हो।\n` +
      (upiLink ? `\n💳 *UPI भुगतान लिंक:* \n${upiLink}\n` : '') +
      `\nसंपर्क: ${shop.phone || ''}\n\n_AltumKhata • Made by Karan with love 💕_`;
  } else if (mode === 'festive') {
    message = `🌸 *नमस्ते ${greeting} जी!*\n\n` +
      `आशा है आप सकुशल हैं। *${shop.shopName || 'किराना स्टोर'}* पर आपका चालू बाकी *${formatCurrency(balance)}* है।\n\n` +
      `महीने का हिसाब चुकता करने हेतु समय निकालें।\n` +
      (upiLink ? `\n💳 *UPI भुगतान:* \n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_${shop.ownerName || ''}_\n\n_AltumKhata • Made by Karan with love 💕_`;
  } else {
    message = `🙏 *नमस्ते ${greeting} जी!*\n\n` +
      `🏪 *${shop.shopName || 'किराना स्टोर'}* पर आपका कुल बाकी हिसाब *${formatCurrency(balance)}* है।\n\n` +
      `📦 कृपया सुविधानुसार भुगतान करने की कृपा करें।\n` +
      (upiLink ? `\n💳 *ऑनलाइन UPI से तुरंत पे करें:* \n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_दुकानदार: ${shop.ownerName || ''} (${shop.phone || ''})_\n\n_AltumKhata • Made by Karan with love 💕_`;
  }

  const encodedMsg = encodeURIComponent(message);
  const waUrl = formattedPhone 
    ? `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMsg}`
    : `https://api.whatsapp.com/send?text=${encodedMsg}`;

  window.open(waUrl, '_blank');
};

export const dialPhone = (phone) => {
  const clean = (phone || '').replace(/[^0-9+]/g, '');
  if (!clean) return;
  window.location.href = `tel:${clean}`;
};
