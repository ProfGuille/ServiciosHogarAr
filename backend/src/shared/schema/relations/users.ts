import { relations } from "drizzle-orm";
import { users } from "../users";
import { achievements } from "../achievements";
import { analyticsEvents } from "../analyticsEvents";

export const usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements),
  analyticsEvents: many(analyticsEvents),
}));

