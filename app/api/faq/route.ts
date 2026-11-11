import { NextResponse } from "next/server";
import faqData from "@/public/data/faq.json";

export async function GET() {
  return NextResponse.json(faqData, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
