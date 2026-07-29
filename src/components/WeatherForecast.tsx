"use client";

import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Snowflake,
  Sun,
  Thermometer,
  type LucideIcon,
} from "lucide-react";
import type { WeatherForecastResult, WeatherIconKey } from "@/lib/weather/forecast";

const WEATHER_ICONS: Record<WeatherIconKey, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-snow": CloudSnow,
  snowflake: Snowflake,
  "cloud-lightning": CloudLightning,
  thermometer: Thermometer,
};

function formatDayLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-ZA", { weekday: "short", day: "numeric", month: "short" });
}

export function WeatherForecast({
  destination,
  startDate,
  endDate,
}: {
  destination: string;
  startDate?: string;
  endDate?: string;
}) {
  const [result, setResult] = useState<WeatherForecastResult | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ destination });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    fetch(`/api/weather?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setResult(data.forecast);
      })
      .catch(() => {
        if (!cancelled) setResult(null);
      });

    return () => {
      cancelled = true;
    };
  }, [destination, startDate, endDate]);

  if (result === undefined) {
    return (
      <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="h-5 w-32 animate-pulse rounded bg-black/10 dark:bg-white/10" />
      </div>
    );
  }

  if (!result || result.days.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
      <div className="flex items-baseline justify-between">
        <h3 className="font-semibold text-tripora-navy dark:text-white">Weather</h3>
        {!result.matchesTripDates && (
          <span className="text-xs text-tripora-navy/50 dark:text-white/50">
            Trip dates are too far out to forecast — showing the next 7 days
          </span>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-7">
        {result.days.map((day) => {
          const Icon = WEATHER_ICONS[day.icon];
          return (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 rounded-xl border border-black/5 p-3 text-center dark:border-white/10"
            >
              <span className="text-xs font-medium text-tripora-navy/60 dark:text-white/60">
                {formatDayLabel(day.date)}
              </span>
              <Icon className="h-6 w-6 text-tripora-blue" strokeWidth={1.75} aria-label={day.description} />
              <span className="text-sm font-medium text-tripora-navy dark:text-white">
                {day.tempMaxC}° <span className="text-tripora-navy/50 dark:text-white/50">{day.tempMinC}°</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
