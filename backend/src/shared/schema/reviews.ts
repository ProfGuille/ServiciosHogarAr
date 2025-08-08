import { pgTable, serial, integer, varchar, doublePrecision, timestamp, boolean, text } from "drizzle-orm/pg-core";
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
  // Enhanced social features
  photos: text('photos'), // JSON array of photo URLs
  isVerified: boolean('is_verified').default(false), // Verified reviews
  helpfulCount: integer('helpful_count').default(0), // Helpful votes
  responseFromProvider: varchar('response_from_provider', { length: 512 }), // Provider can respond
  responseCreatedAt: timestamp('response_created_at'),
  tags: text('tags'), // JSON array of service quality tags
  workQuality: integer('work_quality').default(0), // 1-5 rating for work quality
  communication: integer('communication').default(0), // 1-5 rating for communication
  punctuality: integer('punctuality').default(0), // 1-5 rating for punctuality
  value: integer('value').default(0), // 1-5 rating for value/price
});

export type Review = InferSelectModel<typeof reviews>;