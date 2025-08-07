import { relations } from "drizzle-orm";
import { serviceProviders } from "../serviceProviders";
import { users } from "../users";

export const serviceProvidersRelations = relations(serviceProviders, ({ one }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
}));