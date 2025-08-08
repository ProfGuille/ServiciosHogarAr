import { relations } from "drizzle-orm";
import { categories } from "../categories.js";
import { services } from "../services.js";

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

