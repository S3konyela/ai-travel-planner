import { z } from "zod";

export const guesthouseSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string().optional(),
  rating: z.number().optional(),
  ratingCount: z.number().optional(),
  googleMapsUri: z.string().optional(),
  photoName: z.string().nullable(),
});
export type Guesthouse = z.infer<typeof guesthouseSchema>;

// Scoped to South Africa, matching src/lib/places/autocomplete.ts and photo.ts.
const REGION_CODE = "za";

export async function findGuesthouses(destination: string): Promise<Guesthouse[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || !destination.trim()) return [];

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.googleMapsUri,places.photos",
      },
      body: JSON.stringify({
        textQuery: `guesthouses and bed and breakfasts in ${destination}`,
        regionCode: REGION_CODE,
        maxResultCount: 8,
      }),
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) return [];

    const data = await response.json();
    const places = (data.places ?? []) as Array<{
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      photos?: Array<{ name: string }>;
    }>;

    return places
      .filter((place) => place.displayName?.text)
      .map((place) => ({
        id: place.id,
        name: place.displayName!.text,
        address: place.formattedAddress,
        rating: place.rating,
        ratingCount: place.userRatingCount,
        googleMapsUri: place.googleMapsUri,
        photoName: place.photos?.[0]?.name ?? null,
      }));
  } catch {
    return [];
  }
}
