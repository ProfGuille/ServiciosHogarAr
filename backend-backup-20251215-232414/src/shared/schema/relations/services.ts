import { relations } from "drizzle-orm";
import { services } from "../services.js";
import { serviceCategories } from "../serviceCategories.js"; // importa la tabla relacionada

export const servicesRelations = relations(services, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
}));