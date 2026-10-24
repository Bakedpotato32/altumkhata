import { domToPng } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { formatCurrency, getUpiUri } from './whatsapp';

/**
 * Capture unconstrained 800px virtual DOM element
 */
const captureCanvasToPng = async (canvasElementId) => {
  const node = document.getElementById(canvasElementId);
  if (!node) throw new Error('Receipt canvas not found');

  return await domToPng(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    quality: 0.95
  });
};

/**
 * Build personalized caption message for WhatsApp image share
 */
export const buildReceiptCaption = ({ customer, shop, lang = 'hi' }) => {
  const balance = customer.balance;
  const greeting = customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name;
  const upiLink = shop.upiId ? getUpiUri({
    upiId: shop.upiId,
    shopName: shop.shopName,
    amount: balance
  }) : '';

  if (lang === 'hi') {
    return `🙏 *नमस्ते ${greeting} जी!*\n` +
      `🏪 *${shop.shopName || 'किराना स्टोर'}* की उधार खाता पर्ची संलग्न है।\n` +
      `💰 *कुल बाकी रकम: ${formatCurrency(balance)}*\n` +
      (upiLink ? `\n💳 *ऑनलाइन UPI से तुरंत पे करें:*\n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_संचालक: ${shop.ownerName || ''} (${shop.phone || ''})_`;
  }

  return `🙏 *Hello ${greeting} ji!*\n` +
    `🏪 Attached is your credit receipt from *${shop.shopName || 'Store'}*.\n` +
    `💰 *Total Pending Due: ${formatCurrency(balance)}*\n` +
    (upiLink ? `\n💳 *Pay instantly via UPI:*\n${upiLink}\n` : '') +
    `\nThank you! 🙏\n_Store Owner: ${shop.ownerName || ''} (${shop.phone || ''})_`;
};

/**
 * Export high-contrast PNG photo slip to WhatsApp with proper attachment stream
 */
export const exportReceiptImage = async ({ canvasElementId, filename = 'khata_slip.png', customer, shop, lang = 'hi' }) => {
  const dataUrl = await captureCanvasToPng(canvasElementId);
  const caption = buildReceiptCaption({ customer, shop, lang });
  const rawBase64 = dataUrl.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    // Write image to Android cache directory
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: rawBase64,
      directory: Directory.Cache
    });

    // Share image file stream with pre-filled caption text
    await Share.share({
      title: `${customer.name} - उधार पर्ची`,
      text: caption,
      files: [writeResult.uri],
      dialogTitle: 'WhatsApp पर रसीद भेजें'
    });
    return true;
  } else {
    // Mobile Browser / Web Share API fallback (works directly on mobile Chrome localhost)
    try {
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${customer.name} - उधार पर्ची`,
          text: caption,
          files: [file]
        });
        return true;
      }
    } catch {
      // If Web Share is cancelled or not supported, download the image file
    }

    // Direct download fallback
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  }
};

/**
 * Export PDF receipt
 */
export const exportReceiptPdf = async ({ canvasElementId, filename = 'khata_receipt.pdf', customer, shop, lang = 'hi' }) => {
  const dataUrl = await captureCanvasToPng(canvasElementId);
  const caption = buildReceiptCaption({ customer, shop, lang });

  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve) => { img.onload = resolve; });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [img.width / 2, img.height / 2]
  });

  pdf.addImage(dataUrl, 'PNG', 0, 0, img.width / 2, img.height / 2);
  const pdfBase64 = pdf.output('datauristring');
  const rawBase64 = pdfBase64.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: rawBase64,
      directory: Directory.Cache
    });

    await Share.share({
      title: `${customer.name} - PDF रसीद`,
      text: caption,
      files: [writeResult.uri],
      dialogTitle: 'PDF रसीद शेयर करें'
    });
    return true;
  } else {
    pdf.save(filename);
    return true;
  }
};
