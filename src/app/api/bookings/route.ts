import { NextResponse } from "next/server";
import { bookingRequestSchema } from "@/lib/bookings/schema";
import { isSupabaseAdminConfigured, supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bookingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid booking request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!isSupabaseAdminConfigured || !supabaseAdmin) {
    return NextResponse.json(
      { error: "Bookings aren't available right now. Please try again later." },
      { status: 503 },
    );
  }

  const booking = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .insert({
      guesthouse_id: booking.guesthouseId,
      guesthouse_name: booking.guesthouseName,
      destination: booking.destination,
      check_in: booking.checkIn,
      check_out: booking.checkOut,
      guests: booking.guests,
      guest_name: booking.guestName,
      guest_email: booking.guestEmail,
      notes: booking.notes ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create booking", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }

  return NextResponse.json({ bookingId: data.id });
}
