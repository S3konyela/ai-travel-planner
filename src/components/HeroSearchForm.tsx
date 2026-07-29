"use client";

import { useState } from "react";
import { DestinationAutocomplete } from "./DestinationAutocomplete";

const fieldClass =
  "w-full rounded-xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-tripora-blue dark:border-white/10 dark:bg-transparent";

export function HeroSearchForm() {
  const [destination, setDestination] = useState("");

  return (
    <form
      action="/plan"
      className="mt-10 flex flex-col flex-wrap gap-3 rounded-2xl border border-black/10 bg-white p-4 shadow-lg shadow-black/5 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:items-end"
    >
      <div className="flex-1 basis-full sm:basis-56">
        <label htmlFor="hero-destination" className="mb-1 block text-xs font-medium text-tripora-navy/60 dark:text-white/60">
          Destination
        </label>
        <input type="hidden" name="destination" value={destination} />
        <DestinationAutocomplete
          id="hero-destination"
          value={destination}
          onChange={setDestination}
          placeholder="Where to? (South Africa)"
          className={fieldClass}
        />
      </div>

      <div className="basis-[calc(50%-0.375rem)] sm:basis-36">
        <label htmlFor="hero-start" className="mb-1 block text-xs font-medium text-tripora-navy/60 dark:text-white/60">
          Check in
        </label>
        <input id="hero-start" type="date" name="startDate" className={fieldClass} />
      </div>

      <div className="basis-[calc(50%-0.375rem)] sm:basis-36">
        <label htmlFor="hero-end" className="mb-1 block text-xs font-medium text-tripora-navy/60 dark:text-white/60">
          Check out
        </label>
        <input id="hero-end" type="date" name="endDate" className={fieldClass} />
      </div>

      <div className="basis-[calc(50%-0.375rem)] sm:basis-24">
        <label htmlFor="hero-travelers" className="mb-1 block text-xs font-medium text-tripora-navy/60 dark:text-white/60">
          Guests
        </label>
        <input
          id="hero-travelers"
          type="number"
          name="travelers"
          min={1}
          max={20}
          defaultValue={2}
          className={fieldClass}
        />
      </div>

      <button
        type="submit"
        className="tripora-gradient-bg basis-[calc(50%-0.375rem)] rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 sm:basis-auto sm:self-end"
      >
        Search
      </button>
    </form>
  );
}
