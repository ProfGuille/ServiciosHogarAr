import { 
  pgTable, serial, integer, boolean, time, date, timestamp, index 
} from "drizzle-orm/pg-core";
import { serviceProviders } from "./serviceProviders.js";
import { InferSelectModel } from "drizzle-orm";

export const providerAvailability = pgTable("provider_availability", {
  id: serial("id").primaryKey(),

  providerId: integer("provider_id")
    .notNull()
    .references(() => serviceProviders.id, { onDelete: "cascade" }),

  dayOfWeek: integer("day_of_week"), // 0–6

  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),

  isRecurring: boolean("is_recurring").notNull().default(true),

  specificDate: date("specific_date"),

  maxBookings: integer("max_bookings").notNull().default(1),

  isActive: boolean("is_active").notNull().default(true),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => {
  return {
    providerIdx: index("provider_availability_provider_idx").on(table.providerId),
    recurringIdx: index("provider_availability_recurring_idx").on(table.providerId, table.dayOfWeek),
    specificIdx: index("provider_availability_specific_idx").on(table.providerId, table.specificDate),
  };
});

export type ProviderAvailability = InferSelectModel<typeof providerAvailability>;

