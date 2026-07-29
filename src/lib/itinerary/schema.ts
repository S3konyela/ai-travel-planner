import { z } from "zod";

export const tripRequestSchema = z.object({
  destination: z.string().min(2).max(100),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  days: z.number().int().min(1).max(21).optional(),
  travelers: z.number().int().min(1).max(20).default(1),
  budget: z.enum(["budget", "moderate", "luxury"]).default("moderate"),
  interests: z.array(z.string()).default([]),
});

export type TripRequest = z.infer<typeof tripRequestSchema>;

export const itineraryActivitySchema = z.object({
  time: z.string(),
  title: z.string(),
  description: z.string(),
  estimatedCost: z.string().optional(),
});

export const itineraryDaySchema = z.object({
  day: z.number().int(),
  title: z.string(),
  activities: z.array(itineraryActivitySchema),
});

export const itinerarySchema = z.object({
  destination: z.string(),
  summary: z.string(),
  totalEstimatedCost: z.string().optional(),
  days: z.array(itineraryDaySchema),
  tips: z.array(z.string()).default([]),
});

export type Itinerary = z.infer<typeof itinerarySchema>;
