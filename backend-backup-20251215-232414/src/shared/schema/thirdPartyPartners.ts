import { pgTable, serial, integer, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const thirdPartyPartners = pgTable('third_party_partners', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }).notNull(),
  apiUrl: varchar('api_url', { length: 256 }),
});
export type ThirdPartyPartner = InferSelectModel<typeof thirdPartyPartners>;
export type InsertThirdPartyPartner = InferInsertModel<typeof thirdPartyPartners>;