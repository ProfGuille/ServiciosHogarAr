import { relations } from "drizzle-orm";
import { users } from "../users.js";
import { achievements } from "../achievements.js";
import { analyticsEvents } from "../analyticsEvents.js";

export const usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements),
  analyticsEvents: many(analyticsEvents),
}));

