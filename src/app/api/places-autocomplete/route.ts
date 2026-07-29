import { NextResponse } from "next/server";
import { fetchSouthAfricanCitySuggestions } from "@/lib/places/autocomplete";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input") ?? "";

  const suggestions = await fetchSouthAfricanCitySuggestions(input);
  return NextResponse.json({ suggestions });
}
