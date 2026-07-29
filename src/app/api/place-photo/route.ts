import { NextResponse } from "next/server";

const PHOTO_NAME_PATTERN = /^places\/[\w-]+\/photos\/[\w-]+$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const photoName = searchParams.get("photoName");
  const width = searchParams.get("w") ?? "800";

  if (!photoName || !PHOTO_NAME_PATTERN.test(photoName)) {
    return NextResponse.json({ error: "Invalid photo reference" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 503 });
  }

  const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${width}&key=${apiKey}`;
  const upstream = await fetch(mediaUrl);

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Photo unavailable" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=604800, immutable",
    },
  });
}
