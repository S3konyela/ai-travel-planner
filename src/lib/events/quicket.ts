import { z } from "zod";

export const tripEventSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  imageUrl: z.string().nullable(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  venueName: z.string().nullable(),
  fromPrice: z.number().nullable(),
});
export type TripEvent = z.infer<typeof tripEventSchema>;

const quicketTicketSchema = z.object({
  price: z.number().nullable().optional(),
  soldOut: z.boolean().optional(),
  donation: z.boolean().optional(),
});

const quicketEventSchema = z.object({
  id: z.number(),
  name: z.string(),
  url: z.string(),
  imageUrl: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  venue: z
    .object({
      name: z.string().nullable().optional(),
      addressLine1: z.string().nullable().optional(),
      addressLine2: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  locality: z
    .object({
      levelOne: z.string().nullable().optional(),
      levelTwo: z.string().nullable().optional(),
      levelThree: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  tickets: z.array(quicketTicketSchema).nullable().optional(),
});

const quicketResponseSchema = z.object({
  results: z.array(quicketEventSchema),
  pages: z.number().optional(),
});

const PAGE_SIZE = 100;
const MAX_PAGES = 3;

function eventMatchesDestination(
  event: z.infer<typeof quicketEventSchema>,
  destinationTokens: string[],
): boolean {
  const haystack = [
    event.venue?.name,
    event.venue?.addressLine1,
    event.venue?.addressLine2,
    event.locality?.levelOne,
    event.locality?.levelTwo,
    event.locality?.levelThree,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return destinationTokens.some((token) => haystack.includes(token));
}

function cheapestPrice(tickets: z.infer<typeof quicketTicketSchema>[] | null | undefined): number | null {
  if (!tickets || tickets.length === 0) return null;
  const prices = tickets
    .filter((t) => !t.soldOut && !t.donation && typeof t.price === "number")
    .map((t) => t.price as number);
  if (prices.length === 0) return null;
  return Math.min(...prices);
}

export async function findEvents(destination: string, startDate?: string, endDate?: string): Promise<TripEvent[]> {
  const apiKey = process.env.QUICKET_API_KEY;
  if (!apiKey || !destination.trim()) return [];

  const destinationTokens = destination
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  const rangeStart = startDate ? new Date(startDate) : new Date();
  const rangeEnd = endDate ? new Date(endDate) : null;

  try {
    const matches: z.infer<typeof quicketEventSchema>[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      const params = new URLSearchParams({
        api_key: apiKey,
        pageSize: String(PAGE_SIZE),
        page: String(page),
      });

      const res = await fetch(`https://api.quicket.co.za/api/events?${params.toString()}`, {
        next: { revalidate: 60 * 60 * 3 },
      });
      if (!res.ok) break;

      const parsed = quicketResponseSchema.safeParse(await res.json());
      if (!parsed.success) break;

      for (const event of parsed.data.results) {
        if (eventMatchesDestination(event, destinationTokens)) matches.push(event);
      }

      if (page >= (parsed.data.pages ?? 1)) break;
    }

    const upcoming = matches.filter((event) => {
      const start = new Date(event.startDate);
      if (start < rangeStart) return false;
      if (rangeEnd && start > rangeEnd) return false;
      return true;
    });

    const pool = upcoming.length > 0 ? upcoming : matches.filter((event) => new Date(event.startDate) >= rangeStart);

    return pool
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 8)
      .map((event) => ({
        id: event.id,
        name: event.name,
        url: event.url,
        imageUrl: event.imageUrl ?? null,
        startDate: event.startDate,
        endDate: event.endDate ?? null,
        venueName: event.venue?.name ?? null,
        fromPrice: cheapestPrice(event.tickets),
      }));
  } catch {
    return [];
  }
}
