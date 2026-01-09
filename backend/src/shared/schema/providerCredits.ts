import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { InferSelectModel } from "drizzle-orm";

export const providerCredits = pgTable("provider_credits", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id"),
  currentCredits: integer("current_credits").default(0),
  totalPurchased: integer("total_purchased").default(0),
  totalUsed: integer("total_used").default(0),
  lastPurchaseAt: timestamp("last_purchase_at"),
  updatedAt: timestamp("updated_at").defaultNow()
});

export type ProviderCredits = InferSelectModel<typeof providerCredits>;
