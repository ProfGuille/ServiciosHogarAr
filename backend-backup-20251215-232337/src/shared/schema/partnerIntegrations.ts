import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const partnerIntegrations = pgTable('partner_integrations', {
  id: serial('id').primaryKey(),
  partnerId: integer('partner_id').notNull(),
  integrationType: varchar('integration_type', { length: 64 }),
});
export type PartnerIntegration = InferSelectModel<typeof partnerIntegrations>;
export type InsertPartnerIntegration = InferInsertModel<typeof partnerIntegrations>;