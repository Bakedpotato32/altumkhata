import { domToPng } from 'modern-screenshot';
import { jsPDF } from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

/**
 * Capture the unconstrained 800px virtual DOM element
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
 * Export high-contrast PNG photo slip (Native WhatsApp Photo / Web Download)
 */
export const exportReceiptImage = async (canvasElementId, filename = 'khata_slip.png') => {
  const dataUrl = await captureCanvasToPng(canvasElementId);
  const rawBase64 = dataUrl.split(',')[1];

  if (Capacitor.isNativePlatform()) {
    const writeResult = await Filesystem.writeFile({
      path: filename,
      data: rawBase64,
      directory: Directory.Cache
    });

    await Share.share({
      title: 'उधार पर्ची (Khata Slip)',
      text: 'AltumKhata डिजिटल दुकान रसीद',
      url: writeResult.uri,
      dialogTitle: 'रसीद शेयर करें'
    });
    return true;
  } else {
    // Browser fallback
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
    return true;
  }
};

/**
 * Export formal PDF receipt
 */
export const exportReceiptPdf = async (canvasElementId, filename = 'khata_receipt.pdf') => {
  const dataUrl = await captureCanvasToPng(canvasElementId);

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
      title: 'उधार खाता रसीद (PDF)',
      text: 'AltumKhata PDF रसीद',
      url: writeResult.uri,
      dialogTitle: 'PDF शेयर करें'
    });
    return true;
  } else {
    // Browser fallback
    pdf.save(filename);
    return true;
  }
};
