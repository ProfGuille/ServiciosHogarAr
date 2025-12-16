import { relations } from "drizzle-orm";
import { serviceProviders } from "../serviceProviders.js";
import { users } from "../users.js";

export const serviceProvidersRelations = relations(serviceProviders, ({ one }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
}));