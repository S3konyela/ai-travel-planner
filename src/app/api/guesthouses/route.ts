import { NextResponse } from "next/server";
import { findGuesthouses } from "@/lib/places/lodging";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination") ?? "";

  const guesthouses = await findGuesthouses(destination);
  return NextResponse.json({ guesthouses });
}
