import { NextResponse } from "next/server";
import heroSlides from "@/public/data/hero-slides.json";

export async function GET() {
  return NextResponse.json(heroSlides, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
