import { relations } from "drizzle-orm";
import { services } from "../services.js";
import { categories } from "../categories.js";

export const servicesRelations = relations(services, ({ one }) => ({
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
}));