import { pgTable, serial, integer, doublePrecision } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerCredits = pgTable('provider_credits', {
  id: serial('id').primaryKey(),
  providerId: integer('provider_id').notNull(),
  credits: doublePrecision('credits').notNull().default(0),
});

export type ProviderCredit = InferSelectModel<typeof providerCredits>;