import { relations } from "drizzle-orm";
import { services } from "../services";
import { serviceCategories } from "../serviceCategories"; // importa la tabla relacionada

export const servicesRelations = relations(services, ({ one }) => ({
  category: one(serviceCategories, {
    fields: [services.categoryId],
    references: [serviceCategories.id],
  }),
}));