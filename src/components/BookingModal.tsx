"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Guesthouse } from "@/lib/places/lodging";

export function BookingModal({
  guesthouse,
  destination,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onClose,
}: {
  guesthouse: Guesthouse;
  destination: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onClose: () => void;
}) {
  const [checkIn, setCheckIn] = useState(initialCheckIn ?? "");
  const [checkOut, setCheckOut] = useState(initialCheckOut ?? "");
  const [guests, setGuests] = useState(initialGuests ?? 2);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!checkIn || !checkOut || !guestName.trim() || !guestEmail.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    if (checkOut <= checkIn) {
      setError("Check-out must be after check-in.");
      return;
    }

    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guesthouseId: guesthouse.id,
          guesthouseName: guesthouse.name,
          destination,
          checkIn,
          checkOut,
          guests,
          guestName,
          guestEmail,
          notes: notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to submit booking request.");
      }

      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-tripora-navy"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-tripora-navy dark:text-white">Request to book</h3>
            <p className="mt-0.5 text-sm text-tripora-navy/60 dark:text-white/60">{guesthouse.name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-tripora-navy/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "done" ? (
          <div className="mt-6 space-y-3 text-center">
            <p className="font-medium text-tripora-navy dark:text-white">Request sent</p>
            <p className="text-sm text-tripora-navy/60 dark:text-white/60">
              {guesthouse.name} will follow up at {guestEmail} to confirm availability.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="tripora-gradient-bg mt-2 w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">Check-in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">Check-out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">Guests</label>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">Your name</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">Email</label>
              <input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-tripora-navy/70 dark:text-white/70">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="tripora-gradient-bg w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {status === "submitting" ? "Sending…" : "Send request"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
