import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/itinerary/generate";
import { tripRequestSchema } from "@/lib/itinerary/schema";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = tripRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid trip request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const trip = parsed.data;

  try {
    const itinerary = await generateItinerary(trip);

    if (isSupabaseAdminConfigured && supabaseAdmin) {
      await supabaseAdmin.from("itineraries").insert({
        destination: trip.destination,
        start_date: trip.startDate ?? null,
        end_date: trip.endDate ?? null,
        travelers: trip.travelers,
        budget: trip.budget,
        interests: trip.interests,
        itinerary,
      });
    }

    return NextResponse.json({ itinerary });
  } catch (error) {
    console.error("Failed to generate itinerary", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary" },
      { status: 500 },
    );
  }
}
