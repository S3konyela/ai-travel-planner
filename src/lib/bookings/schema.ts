import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    guesthouseId: z.string().min(1),
    guesthouseName: z.string().min(1),
    destination: z.string().min(1),
    checkIn: z.string(),
    checkOut: z.string(),
    guests: z.number().int().min(1).max(20).default(1),
    guestName: z.string().min(1).max(100),
    guestEmail: z.string().email(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
