# Tripora — Travel Smarter

AI-powered travel itinerary planner. Tell Tripora your destination, dates, budget and
interests, and it generates a day-by-day itinerary — flights, hotels, experiences and
car rentals in one place.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind CSS v4)
- [Google Gemini](https://aistudio.google.com) for itinerary generation (`src/lib/itinerary`)
- [Google Maps Embed + Places API](https://developers.google.com/maps/documentation) for destination previews and photos (`src/components/MapEmbed.tsx`, `src/lib/places`)
- [Supabase](https://supabase.com) to persist generated itineraries and guesthouse booking requests (`supabase/schema.sql`)
- [Quicket](https://developer.quicket.co.za) for live events happening during the trip (`src/lib/events`)

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in the keys you have — all are optional in dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without any API keys set, the app still runs end-to-end: the itinerary generator falls
back to mock data and the map shows a placeholder. Add `GEMINI_API_KEY` to get real
AI-generated itineraries, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` for the live map and
destination photos, `QUICKET_API_KEY` to show live events happening during the trip,
and the Supabase keys to persist generated trips (run `supabase/schema.sql` in the
Supabase SQL editor first).

## Project structure

```
src/app/                 routes (/ landing page, /plan AI planner, /api/itinerary, /api/bookings, /api/events)
src/components/          Header, Footer, ItineraryPlanner, MapEmbed, GuesthouseList, BookingModal, EventsList
src/lib/itinerary/       trip/itinerary zod schemas + Gemini generation logic
src/lib/places/          South Africa-scoped Places autocomplete + photo lookup
src/lib/bookings/        booking request zod schema
src/lib/weather/         Open-Meteo forecast lookup
src/lib/events/          Quicket live events lookup, destination-matched
src/lib/supabase/        browser + server Supabase clients
supabase/schema.sql      itineraries + bookings tables, RLS policies
branding/                source logo/brand sheet
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — lint
