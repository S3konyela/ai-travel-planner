import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { itinerarySchema, type Itinerary, type TripRequest } from "./schema";

export const isGeminiConfigured = Boolean(process.env.GEMINI_API_KEY);

// Gemini's responseJsonSchema wants plain JSON Schema, not the $schema meta key zod attaches.
const ITINERARY_JSON_SCHEMA = (() => {
  const schema = z.toJSONSchema(itinerarySchema) as Record<string, unknown>;
  delete schema.$schema;
  return schema;
})();

function tripLengthInDays(trip: TripRequest): number {
  if (trip.days) return trip.days;
  if (trip.startDate && trip.endDate) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
    if (diff > 0) return diff + 1;
  }
  return 3;
}

export async function generateItinerary(trip: TripRequest): Promise<Itinerary> {
  if (!isGeminiConfigured) {
    return buildMockItinerary(trip);
  }

  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const days = tripLengthInDays(trip);

  const response = await client.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: JSON.stringify({
      destination: trip.destination,
      days,
      travelers: trip.travelers,
      budget: trip.budget,
      interests: trip.interests,
      startDate: trip.startDate,
      endDate: trip.endDate,
    }),
    config: {
      systemInstruction:
        "You are a meticulous travel planner for Tripora, an app whose motto is 'Travel Smarter'. " +
        "Tripora currently only plans trips within South Africa — assume the destination is a South African " +
        "city or region.\n\n" +
        "Accuracy rules — follow these strictly, they matter more than variety or specificity:\n" +
        "- Only name a specific venue (restaurant, shop, attraction) if you are confident it is a real, " +
        "well-established, still-operating place in that exact city. Prominent, long-running landmarks are " +
        "safe to name; small or obscure businesses are not — you cannot verify hours or whether they've closed.\n" +
        "- If you are not confident about a specific business in that specific city, describe the activity " +
        "generically instead (e.g. 'a café in the city centre', 'a local craft market') rather than inventing " +
        "or guessing a name.\n" +
        "- Smaller cities and towns (i.e. anything other than Cape Town, Johannesburg, Durban, Pretoria) are " +
        "areas you have much sparser and less reliable knowledge of. For these, lean more generic and avoid " +
        "naming small businesses at all.\n" +
        "- Never assert that a specific ride-hailing app (Uber, Bolt, etc.) operates in a given city unless you " +
        "are confident it does — coverage varies a lot between South African cities and towns. If transport " +
        "advice is needed, phrase it generically ('use a local ride-hailing app or metered taxi').\n" +
        "- Do not state specific opening days/hours as fact unless well known; if unsure, say the venue type " +
        "and suggest checking hours locally.\n\n" +
        "Produce realistic, well-paced day-by-day itineraries with specific times and rough cost estimates " +
        "(in ZAR) that respect the traveler's budget tier.",
      responseMimeType: "application/json",
      responseJsonSchema: ITINERARY_JSON_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned no itinerary");
  }
  const itinerary = itinerarySchema.parse(JSON.parse(text));
  return {
    ...itinerary,
    tips: [
      ...itinerary.tips,
      "AI-generated — double-check opening hours, prices, and ride-hailing/taxi availability locally before you go.",
    ],
  };
}

const ZAR_RANGES: Record<TripRequest["budget"], { breakfast: string; activity: string; dinner: string; perDay: [number, number] }> = {
  budget: { breakfast: "R80–R150", activity: "R150–R300", dinner: "R120–R250", perDay: [350, 700] },
  moderate: { breakfast: "R150–R250", activity: "R300–R600", dinner: "R250–R450", perDay: [700, 1300] },
  luxury: { breakfast: "R300–R500", activity: "R800–R1 500", dinner: "R600–R1 200", perDay: [1700, 3200] },
};

function formatZAR(amount: number): string {
  return `R${amount.toLocaleString("en-ZA")}`;
}

function buildMockItinerary(trip: TripRequest): Itinerary {
  const days = tripLengthInDays(trip);
  const interestLabel = trip.interests.length > 0 ? trip.interests.join(", ") : "sightseeing and local food";
  const costs = ZAR_RANGES[trip.budget];
  const [perDayLow, perDayHigh] = costs.perDay;
  const totalLow = perDayLow * days * trip.travelers;
  const totalHigh = perDayHigh * days * trip.travelers;

  return {
    destination: trip.destination,
    summary:
      `A ${trip.budget} ${days}-day trip to ${trip.destination} for ${trip.travelers} ` +
      `traveler${trip.travelers > 1 ? "s" : ""}, focused on ${interestLabel}. ` +
      `(Demo itinerary — set GEMINI_API_KEY to generate real AI-planned trips.)`,
    totalEstimatedCost: `${formatZAR(totalLow)}–${formatZAR(totalHigh)} total (excl. flights)`,
    days: Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      title: `Day ${i + 1} in ${trip.destination}`,
      activities: [
        {
          time: "09:00",
          title: "Morning exploration",
          description: `Start the day exploring a well-reviewed neighborhood in ${trip.destination}, grabbing breakfast at a local favorite.`,
          estimatedCost: costs.breakfast,
        },
        {
          time: "13:00",
          title: "Afternoon activity",
          description: `An activity matched to your interests (${interestLabel}), booked in advance where possible.`,
          estimatedCost: costs.activity,
        },
        {
          time: "19:00",
          title: "Dinner",
          description: `Dinner at a spot suited to a ${trip.budget} budget, with reservations recommended.`,
          estimatedCost: costs.dinner,
        },
      ],
    })),
    tips: [
      "This is placeholder demo data — connect an GEMINI_API_KEY to get real AI-generated itineraries.",
      `Best booked ${days > 5 ? "a few months" : "a few weeks"} in advance for ${trip.destination}.`,
    ],
  };
}
