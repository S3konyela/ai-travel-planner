import { z } from "zod";

export const placeSuggestionSchema = z.object({
  placeId: z.string(),
  mainText: z.string(),
  secondaryText: z.string().optional(),
  fullText: z.string(),
});

export type PlaceSuggestion = z.infer<typeof placeSuggestionSchema>;

// Scoped to South Africa for now — Tripora only plans SA trips.
const REGION_CODE = "za";
const PRIMARY_TYPES = ["locality", "sublocality", "administrative_area_level_2"];

export async function fetchSouthAfricanCitySuggestions(input: string): Promise<PlaceSuggestion[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey || !input.trim()) return [];

  const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
    },
    body: JSON.stringify({
      input,
      includedRegionCodes: [REGION_CODE],
      includedPrimaryTypes: PRIMARY_TYPES,
    }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const suggestions = (data.suggestions ?? []) as Array<{
    placePrediction?: {
      placeId: string;
      text: { text: string };
      structuredFormat?: { mainText?: { text: string }; secondaryText?: { text: string } };
    };
  }>;

  return suggestions
    .map((s) => s.placePrediction)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({
      placeId: p.placeId,
      fullText: p.text.text,
      mainText: p.structuredFormat?.mainText?.text ?? p.text.text,
      secondaryText: p.structuredFormat?.secondaryText?.text,
    }));
}
