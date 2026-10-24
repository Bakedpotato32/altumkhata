import { registerPlugin, Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { domToPng } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import { formatCurrency, getUpiUri, sendDirectWhatsAppInvoice } from './whatsapp';

const DirectWhatsApp = registerPlugin('DirectWhatsApp');

export const buildReceiptCaption = ({ customer, shop, lang = 'hi' }) => {
  if (!customer) return 'AltumKhata Digital Receipt';
  const balance = customer.balance || 0;
  const greeting = customer.nickname ? `${customer.name} (${customer.nickname})` : customer.name;
  const upiLink = shop?.upiId ? getUpiUri({
    upiId: shop.upiId,
    shopName: shop.shopName,
    amount: balance
  }) : '';

  if (lang === 'hi') {
    return `🙏 *नमस्ते ${greeting} जी!*\n\n` +
      `🏪 *${shop?.shopName || 'किराना स्टोर'}* की उधार खाता पर्ची संलग्न है।\n` +
      `💰 *कुल बाकी हिसाब: ${formatCurrency(balance)}*\n` +
      (upiLink ? `\n💳 *ऑनलाइन UPI से तुरंत पे करें:*\n${upiLink}\n` : '') +
      `\nधन्यवाद! 🙏\n_दुकानदार: ${shop?.ownerName || ''} (${shop?.phone || ''})_`;
  }

  return `🙏 *Hello ${greeting} ji!*\n\n` +
    `🏪 Attached is your credit receipt slip from *${shop?.shopName || 'Store'}*.\n` +
    `💰 *Total Pending Due: ${formatCurrency(balance)}*\n` +
    (upiLink ? `\n💳 *Pay instantly via UPI:*\n${upiLink}\n` : '') +
    `\nThank you! 🙏\n_Store Owner: ${shop?.ownerName || ''} (${shop?.phone || ''})_`;
};

export const captureCanvasToBlob = async (canvasElementId) => {
  const node = document.getElementById(canvasElementId);
  if (!node) throw new Error('Receipt canvas element not found');

  const dataUrl = await domToPng(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    quality: 0.95
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return { dataUrl, blob };
};

/**
 * Direct WhatsApp Image Dispatch with Automatic Fallback
 */
export const exportReceiptImageAttachment = async ({
  canvasElementId = 'virtual-receipt-canvas',
  filename = 'khata_slip.png',
  customer,
  shop,
  lang = 'hi'
}) => {
  const { dataUrl, blob } = await captureCanvasToBlob(canvasElementId);
  const caption = buildReceiptCaption({ customer, shop, lang });
  const rawBase64 = dataUrl.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: rawBase64,
      directory: Directory.Cache
    });

    try {
      // 1. Try Native Direct WhatsApp Plugin
      await DirectWhatsApp.shareImageToNumber({
        phone: customer.phone,
        filePath: writeResult.uri,
        message: caption
      });
      return true;
    } catch (pluginErr) {
      console.warn('DirectWhatsApp plugin fallback:', pluginErr);
      // 2. Safe Fallback: Standard Capacitor Share Sheet
      try {
        await Share.share({
          title: `${customer?.name || 'ग्राहक'} - उधार पर्ची`,
          text: caption,
          files: [writeResult.uri],
          dialogTitle: 'WhatsApp पर रसीद भेजें'
        });
        return true;
      } catch {
        sendDirectWhatsAppInvoice({ customer, shop, lang });
        return true;
      }
    }
  } else {
    // Web Share fallback for browser testing
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `${customer?.name || 'ग्राहक'} - उधार पर्ची`,
        text: caption,
        files: [file]
      });
      return true;
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  }
};

export const exportReceiptPdf = async ({
  canvasElementId = 'virtual-receipt-canvas',
  filename = 'khata_receipt.pdf',
  customer,
  shop,
  lang = 'hi'
}) => {
  const { dataUrl } = await captureCanvasToBlob(canvasElementId);
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

    try {
      await Share.share({
        title: `${customer?.name || 'ग्राहक'} - PDF रसीद`,
        text: caption,
        files: [writeResult.uri],
        dialogTitle: 'PDF रसीद शेयर करें'
      });
    } catch {
      // Fallback
    }
    return true;
  } else {
    pdf.save(filename);
    return true;
  }
};
