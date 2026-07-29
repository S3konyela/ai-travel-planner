import { NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weather/forecast";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination") ?? "";
  const startDate = searchParams.get("startDate") ?? undefined;
  const endDate = searchParams.get("endDate") ?? undefined;

  if (!destination.trim()) {
    return NextResponse.json({ forecast: null });
  }

  const forecast = await getWeatherForecast(destination, startDate, endDate);
  return NextResponse.json({ forecast });
}
