import { z } from "zod";

export const eventTypeSchema = z.enum([
  "created",
  "updated",
  "deleted",
  "viewed",
  "clicked",
  "shared",
  "searched",
  "booked",
  "cancelled",
  "completed"
]);

export type EventType = z.infer<typeof eventTypeSchema>;