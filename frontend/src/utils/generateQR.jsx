import QRCode from 'qrcode';

const generateQR = async (uri) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(uri);
    return qrCodeDataUrl;
  } catch (err) {
    console.error("Error generating QR code:", err);
    throw err;
  }
};

export default generateQR;
