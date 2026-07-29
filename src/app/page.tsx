import Link from "next/link";
import { Building2, Car, Plane, Star } from "lucide-react";
import { HeroSearchForm } from "@/components/HeroSearchForm";
import { findPlacePhotoName } from "@/lib/places/photo";

const CATEGORIES = [
  { id: "stays", label: "Stays", icon: Building2, blurb: "Hotels, apartments and unique stays near your itinerary." },
  { id: "flights", label: "Flights", icon: Plane, blurb: "Compare routes and fares for every leg of the trip." },
  { id: "experiences", label: "Experiences", icon: Star, blurb: "Tours, activities and reservations, booked ahead." },
  { id: "car-rentals", label: "Car Rentals", icon: Car, blurb: "Pick-up and drop-off options wherever you land." },
];

const DESTINATIONS = [
  { name: "Cape Town, South Africa", tag: "Coast & mountains" },
  { name: "Johannesburg, South Africa", tag: "City & culture" },
  { name: "Durban, South Africa", tag: "Beaches & surf" },
  { name: "Stellenbosch, South Africa", tag: "Winelands" },
];

export default async function Home() {
  const destinations = await Promise.all(
    DESTINATIONS.map(async (destination) => ({
      ...destination,
      photoName: await findPlacePhotoName(destination.name),
    })),
  );

  return (
    <main className="flex flex-1 flex-col">
      <section className="relative overflow-hidden">
        <div className="tripora-gradient-bg pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-tripora-navy dark:text-white sm:text-5xl">
            Discover more. <span className="tripora-gradient-text">Travel better.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-tripora-navy/70 dark:text-white/70">
            Tripora plans your trip with AI — a day-by-day itinerary built around your dates, budget and interests.
            Currently focused on destinations across South Africa.
          </p>

          <HeroSearchForm />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="tripora-gradient-bg flex flex-col items-start justify-between gap-6 rounded-3xl p-10 text-white sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Your journey, <span className="opacity-90">perfectly planned.</span>
            </h2>
            <p className="mt-2 max-w-md text-white/85">
              Tell the Tripora AI planner your destination, dates, budget and interests — get a full itinerary in seconds.
            </p>
          </div>
          <Link
            href="/plan"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-tripora-navy transition hover:bg-white/90"
          >
            Plan my trip
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <h2 className="text-xl font-semibold text-tripora-navy dark:text-white">Browse by category</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              id={category.id}
              className="scroll-mt-24 rounded-2xl border border-black/10 p-5 transition hover:border-tripora-blue/40 hover:shadow-md dark:border-white/10"
            >
              <category.icon className="h-6 w-6 text-tripora-blue" strokeWidth={1.75} />
              <div className="mt-3 font-semibold text-tripora-navy dark:text-white">{category.label}</div>
              <p className="mt-1 text-sm text-tripora-navy/60 dark:text-white/60">{category.blurb}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold text-tripora-navy dark:text-white">Popular destinations</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((destination) => (
            <Link
              key={destination.name}
              href={`/plan?destination=${encodeURIComponent(destination.name)}`}
              className="group overflow-hidden rounded-2xl border border-black/10 dark:border-white/10"
            >
              <div className="relative flex h-32 items-end overflow-hidden p-4">
                {destination.photoName ? (
                  // eslint-disable-next-line @next/next/no-img-element -- proxied same-origin image, not a static asset
                  <img
                    src={`/api/place-photo?photoName=${encodeURIComponent(destination.photoName)}&w=600`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="tripora-gradient-bg absolute inset-0" />
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                <span className="relative text-sm font-medium text-white">{destination.tag}</span>
              </div>
              <div className="p-4">
                <div className="font-semibold text-tripora-navy dark:text-white">{destination.name}</div>
                <div className="mt-1 text-sm text-tripora-blue">Plan this trip →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
