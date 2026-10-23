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

export const sendWhatsAppReminder = ({ customer, shop, mode = 'polite', lang = 'hi' }) => {
  const balance = customer.balance;
  if (balance <= 0) return;

  const phone = (customer.phone || '').replace(/[^0-9]/g, '');
  const formattedPhone = phone.length === 10 ? `91${phone}` : phone;

  const upiLink = shop.upiId ? getUpiUri({
    upiId: shop.upiId,
    shopName: shop.shopName,
    amount: balance
  }) : '';

  let message = '';
  const greeting = customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name;

  if (mode === 'firm') {
    // Strict / Urgent Tone
    message = `⚠️ *महत्वपूर्ण सूचना - बकाया हिसाब*\n\n` +
      `श्रीमान *${greeting} जी*,\n` +
      `*${shop.shopName || 'किराना स्टोर'}* पर आपका कुल बाकी *${formatCurrency(balance)}* काफी समय से लंबित है।\n\n` +
      `कृपया आज ही इस राशि का भुगतान कर खाता व्यवस्थित करें ताकि भविष्य की उधारी सेवा बाधित न हो।\n` +
      (upiLink ? `\n💳 *तुरंत UPI से भुगतान करें:* \n${upiLink}\n` : '') +
      `\nसंपर्क: ${shop.phone || ''}`;
  } else if (mode === 'festive') {
    // Festive / Monthly Settlement Tone
    message = `🌸 *नमस्ते ${greeting} जी!*\n\n` +
      `आशा है आप सपरिवार सकुशल हैं। *${shop.shopName || 'किराना स्टोर'}* पर आपका चालू बाकी *${formatCurrency(balance)}* है।\n\n` +
      `महीने का हिसाब चुकता करने के लिए कृपया समय निकालें।\n` +
      (upiLink ? `\n💳 *ऑनलाइन UPI भुगतान:* \n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_${shop.ownerName || ''}_`;
  } else {
    // Regular Polite Reminder
    message = `🙏 *नमस्ते ${greeting} जी!*\n\n` +
      `🏪 *${shop.shopName || 'किराना स्टोर'}* पर आपका कुल बाकी हिसाब *${formatCurrency(balance)}* है।\n\n` +
      `📦 कृपया सुविधानुसार भुगतान करने की कृपा करें।\n` +
      (upiLink ? `\n💳 *ऑनलाइन UPI से तुरंत पे करें:* \n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_दुकानदार: ${shop.ownerName || ''} (${shop.phone || ''})_`;
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
