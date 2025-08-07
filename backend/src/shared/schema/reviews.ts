import { pgTable, serial, integer, varchar, doublePrecision, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  rating: doublePrecision('rating').notNull(),
  comment: varchar('comment', { length: 1024 }),
  createdAt: timestamp('created_at').defaultNow(),
  reviewerId: integer('reviewer_id').notNull(),
  revieweeId: integer('reviewee_id').notNull(),
  serviceRequestId: integer('service_request_id').notNull(),
});

export type Review = InferSelectModel<typeof reviews>;