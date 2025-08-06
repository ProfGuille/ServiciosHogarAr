import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { serviceProviders } from "./serviceProviders";

export const providerCredits = pgTable("provider_credits", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id),
  credits: integer("credits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const providerCreditsRelations = relations(providerCredits, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerCredits.providerId],
    references: [serviceProviders.id],
  }),
}));

