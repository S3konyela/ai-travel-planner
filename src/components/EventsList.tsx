"use client";

import { useEffect, useState } from "react";
import { CalendarDays, MapPin } from "lucide-react";
import type { TripEvent } from "@/lib/events/quicket";

function formatEventDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function EventsList({
  destination,
  startDate,
  endDate,
}: {
  destination: string;
  startDate?: string;
  endDate?: string;
}) {
  const [events, setEvents] = useState<TripEvent[] | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ destination });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setEvents(data.events ?? []);
      })
      .catch(() => {
        if (!cancelled) setEvents([]);
      });

    return () => {
      cancelled = true;
    };
  }, [destination, startDate, endDate]);

  if (events === undefined) {
    return (
      <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="h-5 w-40 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <h3 className="font-semibold text-tripora-navy dark:text-white">Live events during your trip</h3>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
        {events.map((event) => (
          <a
            key={event.id}
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-56 shrink-0 overflow-hidden rounded-xl border border-black/10 transition hover:border-tripora-blue/40 hover:shadow-md dark:border-white/10"
          >
            <div className="relative h-32 w-full overflow-hidden bg-black/5 dark:bg-white/5">
              {event.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- external Quicket-hosted event image
                <img
                  src={event.imageUrl}
                  alt=""
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="tripora-gradient-bg h-full w-full opacity-40" />
              )}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-semibold text-tripora-navy dark:text-white">{event.name}</div>
              <div className="mt-1 flex items-center gap-1 text-xs text-tripora-navy/60 dark:text-white/60">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                {formatEventDate(event.startDate)}
              </div>
              {event.venueName && (
                <div className="mt-0.5 flex items-center gap-1 text-xs text-tripora-navy/60 dark:text-white/60">
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{event.venueName}</span>
                </div>
              )}
              {event.fromPrice !== null && (
                <div className="mt-1 text-xs font-medium text-tripora-blue">
                  From R{event.fromPrice.toLocaleString("en-ZA")}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
