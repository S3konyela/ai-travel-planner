"use client";

import { useState } from "react";
import type { Itinerary } from "@/lib/itinerary/schema";
import { DestinationAutocomplete } from "./DestinationAutocomplete";
import { EventsList } from "./EventsList";
import { GuesthouseList } from "./GuesthouseList";
import { MapEmbed } from "./MapEmbed";
import { WeatherForecast } from "./WeatherForecast";

const INTEREST_OPTIONS = ["Food", "Culture", "Nature", "Nightlife", "Shopping", "Adventure", "Relaxation"];
const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget" },
  { value: "moderate", label: "Moderate" },
  { value: "luxury", label: "Luxury" },
] as const;

export function ItineraryPlanner({
  initialDestination = "",
  initialStartDate = "",
  initialEndDate = "",
  initialTravelers = 2,
}: {
  initialDestination?: string;
  initialStartDate?: string;
  initialEndDate?: string;
  initialTravelers?: number;
}) {
  const [destination, setDestination] = useState(initialDestination);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [travelers, setTravelers] = useState(initialTravelers);
  const [budget, setBudget] = useState<(typeof BUDGET_OPTIONS)[number]["value"]>("moderate");
  const [interests, setInterests] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest],
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!destination.trim()) {
      setError("Please enter a destination.");
      return;
    }

    setLoading(true);
    setError(null);
    setItinerary(null);

    try {
      const response = await fetch("/api/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          travelers,
          budget,
          interests,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const data = await response.json();
      setItinerary(data.itinerary);
    } catch {
      setError("Something went wrong generating your itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[380px_1fr]">
      <form
        onSubmit={handleSubmit}
        className="h-fit space-y-5 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5"
      >
        <div>
          <label className="text-sm font-medium text-tripora-navy dark:text-white">Destination</label>
          <DestinationAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="e.g. Cape Town"
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
          />
          <p className="mt-1 text-xs text-tripora-navy/40 dark:text-white/40">Currently scoped to South African cities.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-tripora-navy dark:text-white">Start date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-tripora-navy dark:text-white">End date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-tripora-navy dark:text-white">Travelers</label>
          <input
            type="number"
            min={1}
            max={20}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-tripora-navy dark:text-white">Budget</label>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {BUDGET_OPTIONS.map((option) => (
              <button
                type="button"
                key={option.value}
                onClick={() => setBudget(option.value)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                  budget === option.value
                    ? "tripora-gradient-bg border-transparent text-white"
                    : "border-black/10 text-tripora-navy/70 dark:border-white/10 dark:text-white/70"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-tripora-navy dark:text-white">Interests</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                type="button"
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  interests.includes(interest)
                    ? "border-tripora-blue bg-tripora-blue/10 text-tripora-blue"
                    : "border-black/10 text-tripora-navy/60 dark:border-white/10 dark:text-white/60"
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="tripora-gradient-bg w-full rounded-xl py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Planning your trip…" : "Generate itinerary"}
        </button>
      </form>

      <div className="space-y-6">
        {!itinerary && !loading && (
          <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 p-10 text-center text-tripora-navy/50 dark:border-white/15 dark:text-white/40">
            <p className="text-lg font-medium">Your itinerary will appear here</p>
            <p className="mt-1 max-w-sm text-sm">
              Fill in your destination and preferences, then generate a day-by-day plan.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl border border-black/10 dark:border-white/10">
            <p className="animate-pulse text-sm text-tripora-navy/60 dark:text-white/60">
              Tripora AI is planning your trip…
            </p>
          </div>
        )}

        {itinerary && (
          <>
            <MapEmbed destination={itinerary.destination} />

            <WeatherForecast destination={itinerary.destination} startDate={startDate} endDate={endDate} />

            <EventsList destination={itinerary.destination} startDate={startDate || undefined} endDate={endDate || undefined} />

            <GuesthouseList
              destination={itinerary.destination}
              startDate={startDate || undefined}
              endDate={endDate || undefined}
              travelers={travelers}
            />

            <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
              <h2 className="text-xl font-bold text-tripora-navy dark:text-white">{itinerary.destination}</h2>
              <p className="mt-2 text-sm text-tripora-navy/70 dark:text-white/70">{itinerary.summary}</p>
              {itinerary.totalEstimatedCost && (
                <p className="mt-2 text-sm font-medium text-tripora-blue">
                  Estimated cost: {itinerary.totalEstimatedCost}
                </p>
              )}
            </div>

            {itinerary.days.map((day) => (
              <div key={day.day} className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
                <h3 className="font-semibold text-tripora-navy dark:text-white">{day.title}</h3>
                <ul className="mt-4 space-y-4">
                  {day.activities.map((activity, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="w-14 shrink-0 text-sm font-medium text-tripora-blue">{activity.time}</span>
                      <div>
                        <p className="font-medium text-tripora-navy dark:text-white">{activity.title}</p>
                        <p className="mt-0.5 text-sm text-tripora-navy/60 dark:text-white/60">
                          {activity.description}
                        </p>
                        {activity.estimatedCost && (
                          <p className="mt-0.5 text-xs text-tripora-teal">{activity.estimatedCost}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {itinerary.tips.length > 0 && (
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-6 dark:border-white/10 dark:bg-white/[0.03]">
                <h3 className="font-semibold text-tripora-navy dark:text-white">Tips</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-tripora-navy/70 dark:text-white/70">
                  {itinerary.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
