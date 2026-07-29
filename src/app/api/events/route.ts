import { NextResponse } from "next/server";
import { findEvents } from "@/lib/events/quicket";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination") ?? "";
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  const events = await findEvents(destination, startDate, endDate);
  return NextResponse.json({ events });
}
