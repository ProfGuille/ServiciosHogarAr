import { relations } from "drizzle-orm";
import { achievements } from "../achievements.js";
import { users } from "../users.js"; // Asegúrate de tener este archivo

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));