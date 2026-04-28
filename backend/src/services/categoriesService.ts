import { sql } from "../db.js";

export const categoriesService = {
  async getAll() {
    return sql`
      SELECT id, name, description, icon, is_active as "isActive", created_at as "createdAt"
      FROM service_categories
      ORDER BY name ASC
    `;
  }
};
