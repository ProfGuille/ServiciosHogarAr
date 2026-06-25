import { pgTable, serial, integer, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  serviceRequestId: integer('service_request_id').notNull(),
  reviewerId: varchar('reviewer_id').notNull(),
  revieweeId: varchar('reviewee_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isPublic: boolean('is_public').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Review = InferSelectModel<typeof reviews>;
export type InsertReview = typeof reviews.$inferInsert;
