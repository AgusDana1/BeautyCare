import { NextResponse } from "next/server";
import { generateQrisString, generateQrCode } from "@/lib/qris";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const invoice = searchParams.get("invoice") || "INV-DEMO";
  const amount = parseFloat(searchParams.get("amount") || "100000");

  const qrisPayload = generateQrisString(invoice, amount);
  const qrDataUrl = await generateQrCode(qrisPayload);

  return NextResponse.json({
    payload: qrisPayload,
    qrDataUrl,
  });
}
