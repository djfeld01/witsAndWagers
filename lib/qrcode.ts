import QRCode from "qrcode";

/**
 * Generate a QR code as a data URL from a given text/URL
 * @param text - The text or URL to encode in the QR code
 * @returns Promise resolving to a data URL string
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    return dataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code");
  }
}
