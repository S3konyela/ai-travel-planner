import { ItineraryPlanner } from "@/components/ItineraryPlanner";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string; startDate?: string; endDate?: string; travelers?: string }>;
}) {
  const { destination, startDate, endDate, travelers } = await searchParams;
  const parsedTravelers = travelers ? Number(travelers) : undefined;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-tripora-navy dark:text-white">
        Plan your trip with <span className="tripora-gradient-text">Tripora AI</span>
      </h1>
      <p className="mt-2 max-w-2xl text-tripora-navy/70 dark:text-white/70">
        Tell us where you&apos;re headed and we&apos;ll put together a day-by-day itinerary tailored to your budget
        and interests.
      </p>

      <div className="mt-10">
        <ItineraryPlanner
          initialDestination={destination ?? ""}
          initialStartDate={startDate ?? ""}
          initialEndDate={endDate ?? ""}
          initialTravelers={parsedTravelers && parsedTravelers > 0 ? parsedTravelers : undefined}
        />
      </div>
    </main>
  );
}
