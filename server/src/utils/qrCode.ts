let QRCode: any;
try {
  QRCode = require('qrcode');
} catch (err) {
  // noop - module may not be present in dev environment
}

export const generateQRCode = async (data: string): Promise<string> => {
  try {
  const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

export const generateBookingQRCode = async (bookingId: string): Promise<string> => {
  const qrData = {
    type: 'booking',
    id: bookingId,
    timestamp: new Date().toISOString()
  };
  
  return generateQRCode(JSON.stringify(qrData));
};