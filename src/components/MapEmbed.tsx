const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function MapEmbed({ destination }: { destination: string }) {
  if (!mapsApiKey) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.02] p-6 text-center text-sm text-tripora-navy/60 dark:border-white/15 dark:bg-white/[0.03] dark:text-white/50">
        <p className="font-medium">Map preview unavailable</p>
        <p className="mt-1">
          Add <code className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
          show an interactive map of {destination}.
        </p>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${encodeURIComponent(destination)}`;

  return (
    <iframe
      title={`Map of ${destination}`}
      src={src}
      className="h-64 w-full rounded-2xl border border-black/10 dark:border-white/10"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
