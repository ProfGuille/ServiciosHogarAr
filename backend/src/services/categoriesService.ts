import { db } from "../db.js";
import { categories } from "../shared/schema/categories.js";
import { asc } from "drizzle-orm";

export const categoriesService = {
  async getAll() {
    return db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
  }
};

