import { z } from "zod";

export const WEATHER_ICON_KEYS = [
  "sun",
  "cloud-sun",
  "cloud",
  "cloud-fog",
  "cloud-drizzle",
  "cloud-rain",
  "cloud-snow",
  "snowflake",
  "cloud-lightning",
  "thermometer",
] as const;
export type WeatherIconKey = (typeof WEATHER_ICON_KEYS)[number];

export const weatherDaySchema = z.object({
  date: z.string(),
  tempMaxC: z.number(),
  tempMinC: z.number(),
  description: z.string(),
  icon: z.enum(WEATHER_ICON_KEYS),
});
export type WeatherDay = z.infer<typeof weatherDaySchema>;

export interface WeatherForecastResult {
  days: WeatherDay[];
  // false when the trip dates fall outside Open-Meteo's ~16-day forecast window,
  // so `days` shows the next 7 days from today instead of the actual trip dates.
  matchesTripDates: boolean;
}

const WEATHER_CODES: Record<number, { description: string; icon: WeatherIconKey }> = {
  0: { description: "Clear sky", icon: "sun" },
  1: { description: "Mainly clear", icon: "cloud-sun" },
  2: { description: "Partly cloudy", icon: "cloud-sun" },
  3: { description: "Overcast", icon: "cloud" },
  45: { description: "Fog", icon: "cloud-fog" },
  48: { description: "Rime fog", icon: "cloud-fog" },
  51: { description: "Light drizzle", icon: "cloud-drizzle" },
  53: { description: "Drizzle", icon: "cloud-drizzle" },
  55: { description: "Dense drizzle", icon: "cloud-drizzle" },
  56: { description: "Freezing drizzle", icon: "cloud-drizzle" },
  57: { description: "Freezing drizzle", icon: "cloud-drizzle" },
  61: { description: "Light rain", icon: "cloud-rain" },
  63: { description: "Rain", icon: "cloud-rain" },
  65: { description: "Heavy rain", icon: "cloud-rain" },
  66: { description: "Freezing rain", icon: "cloud-rain" },
  67: { description: "Freezing rain", icon: "cloud-rain" },
  71: { description: "Light snow", icon: "cloud-snow" },
  73: { description: "Snow", icon: "cloud-snow" },
  75: { description: "Heavy snow", icon: "snowflake" },
  77: { description: "Snow grains", icon: "cloud-snow" },
  80: { description: "Light showers", icon: "cloud-drizzle" },
  81: { description: "Showers", icon: "cloud-rain" },
  82: { description: "Violent showers", icon: "cloud-lightning" },
  85: { description: "Snow showers", icon: "cloud-snow" },
  86: { description: "Snow showers", icon: "snowflake" },
  95: { description: "Thunderstorm", icon: "cloud-lightning" },
  96: { description: "Thunderstorm with hail", icon: "cloud-lightning" },
  99: { description: "Thunderstorm with hail", icon: "cloud-lightning" },
};

function describeCode(code: number): { description: string; icon: WeatherIconKey } {
  return WEATHER_CODES[code] ?? { description: "Weather data unavailable", icon: "thermometer" };
}

async function geocode(destination: string): Promise<{ latitude: number; longitude: number } | null> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json&country_code=ZA`,
    { next: { revalidate: 60 * 60 * 24 * 30 } },
  );
  if (!res.ok) return null;

  const data = await res.json();
  const place = data.results?.[0];
  if (!place) return null;
  return { latitude: place.latitude, longitude: place.longitude };
}

export async function getWeatherForecast(
  destination: string,
  startDate?: string,
  endDate?: string,
): Promise<WeatherForecastResult | null> {
  try {
    const location = await geocode(destination);
    if (!location) return null;

    const params = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      daily: "weathercode,temperature_2m_max,temperature_2m_min",
      timezone: "auto",
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate) : null;
    const daysUntilStart = start ? Math.floor((start.getTime() - today.getTime()) / 86_400_000) : null;
    const tripDatesInRange = daysUntilStart !== null && daysUntilStart >= 0 && daysUntilStart <= 15 && Boolean(endDate);

    if (tripDatesInRange && startDate && endDate) {
      params.set("start_date", startDate);
      params.set("end_date", endDate);
    } else {
      params.set("forecast_days", "7");
    }

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 3 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const dates: string[] = data.daily?.time ?? [];
    const codes: number[] = data.daily?.weathercode ?? [];
    const maxTemps: number[] = data.daily?.temperature_2m_max ?? [];
    const minTemps: number[] = data.daily?.temperature_2m_min ?? [];

    const days: WeatherDay[] = dates.map((date, i) => {
      const { description, icon } = describeCode(codes[i]);
      return {
        date,
        tempMaxC: Math.round(maxTemps[i]),
        tempMinC: Math.round(minTemps[i]),
        description,
        icon,
      };
    });

    if (days.length === 0) return null;
    return { days, matchesTripDates: tripDatesInRange };
  } catch {
    return null;
  }
}
