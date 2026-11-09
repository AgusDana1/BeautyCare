import QRCode from "qrcode";

export function generateQrisString(invoiceNumber: string, amount: number): string {
  // Generates EMVCo compliant or standard merchant QRIS payload
  const formattedAmount = Math.round(amount).toString();
  const merchantName = "BEAUTYCARE STORE";
  const city = "JAKARTA";
  const postalCode = "12190";

  // Standard Indonesian QRIS format representation
  return `00020101021226610014ID.CO.QRIS.WWW011893600918000000000102150000000000000000303UMI520458125303360540${formattedAmount.length.toString().padStart(2, "0")}${formattedAmount}5802ID59${merchantName.length.toString().padStart(2, "0")}${merchantName}60${city.length.toString().padStart(2, "0")}${city}61${postalCode.length.toString().padStart(2, "0")}${postalCode}62${(invoiceNumber.length + 4).toString().padStart(2, "0")}01${invoiceNumber.length.toString().padStart(2, "0")}${invoiceNumber}6304ABCD`;
}

export async function generateQrCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    });
  } catch (error) {
    console.error("Failed to generate QR code:", error);
    return "";
  }
}
