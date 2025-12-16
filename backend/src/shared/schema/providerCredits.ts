import { pgTable, integer, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerCredits = pgTable("provider_credits", {
  providerId: integer("provider_id").primaryKey(),
  credits: integer("credits").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type ProviderCredits = InferSelectModel<typeof providerCredits>;

