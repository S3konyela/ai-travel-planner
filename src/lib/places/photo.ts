// Scoped to South Africa, matching src/lib/places/autocomplete.ts.
const REGION_CODE = "za";

/**
 * Looks up a place by text query and returns its first photo's resource
 * name (e.g. "places/ChIJ.../photos/AUEE..."), not a browsable URL — the
 * API key stays server-side and is only used again in the /api/place-photo
 * proxy route when actually fetching the image bytes.
 */
export async function findPlacePhotoName(query: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({
        textQuery: query,
        regionCode: REGION_CODE,
        maxResultCount: 1,
      }),
      next: { revalidate: 60 * 60 * 24 * 7 },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const photoName = data.places?.[0]?.photos?.[0]?.name;
    return typeof photoName === "string" ? photoName : null;
  } catch {
    return null;
  }
}
