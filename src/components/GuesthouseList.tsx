"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import type { Guesthouse } from "@/lib/places/lodging";
import { BookingModal } from "./BookingModal";

export function GuesthouseList({
  destination,
  startDate,
  endDate,
  travelers,
}: {
  destination: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
}) {
  const [guesthouses, setGuesthouses] = useState<Guesthouse[] | undefined>(undefined);
  const [booking, setBooking] = useState<Guesthouse | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/guesthouses?destination=${encodeURIComponent(destination)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setGuesthouses(data.guesthouses ?? []);
      })
      .catch(() => {
        if (!cancelled) setGuesthouses([]);
      });

    return () => {
      cancelled = true;
    };
  }, [destination]);

  if (guesthouses === undefined) {
    return (
      <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="h-5 w-48 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (guesthouses.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <h3 className="font-semibold text-tripora-navy dark:text-white">Guesthouses &amp; BnBs nearby</h3>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {guesthouses.map((place) => (
          <div
            key={place.id}
            className="group w-56 shrink-0 overflow-hidden rounded-xl border border-black/10 transition hover:border-tripora-blue/40 hover:shadow-md dark:border-white/10"
          >
            <a href={place.googleMapsUri ?? "#"} target="_blank" rel="noopener noreferrer" className="block">
              <div className="relative h-32 w-full overflow-hidden bg-black/5 dark:bg-white/5">
                {place.photoName ? (
                  // eslint-disable-next-line @next/next/no-img-element -- proxied same-origin image, not a static asset
                  <img
                    src={`/api/place-photo?photoName=${encodeURIComponent(place.photoName)}&w=400`}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="tripora-gradient-bg h-full w-full opacity-40" />
                )}
              </div>
              <div className="p-3 pb-2">
                <div className="truncate text-sm font-semibold text-tripora-navy dark:text-white">{place.name}</div>
                {place.address && (
                  <div className="mt-0.5 truncate text-xs text-tripora-navy/60 dark:text-white/60">
                    {place.address}
                  </div>
                )}
                {place.rating !== undefined && (
                  <div className="mt-1 flex items-center gap-1 text-xs font-medium text-tripora-blue">
                    <Star className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                    {place.rating.toFixed(1)}
                    {place.ratingCount !== undefined && (
                      <span className="text-tripora-navy/50 dark:text-white/50">({place.ratingCount})</span>
                    )}
                  </div>
                )}
              </div>
            </a>
            <div className="px-3 pb-3">
              <button
                type="button"
                onClick={() => setBooking(place)}
                className="w-full rounded-lg border border-tripora-blue/40 py-1.5 text-xs font-semibold text-tripora-blue transition hover:bg-tripora-blue/10"
              >
                Request to book
              </button>
            </div>
          </div>
        ))}
      </div>

      {booking && (
        <BookingModal
          guesthouse={booking}
          destination={destination}
          initialCheckIn={startDate}
          initialCheckOut={endDate}
          initialGuests={travelers}
          onClose={() => setBooking(null)}
        />
      )}
    </div>
  );
}
