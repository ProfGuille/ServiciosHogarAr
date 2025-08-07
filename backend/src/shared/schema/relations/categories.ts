import { relations } from "drizzle-orm";
import { categories } from "../categories";
import { services } from "../services";

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));

