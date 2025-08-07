#!/bin/bash

BASE_DIR="backend/src/shared/schema/relations"
mkdir -p "$BASE_DIR"

create_file() {
  FILE="$1"
  CONTENT="$2"
  echo "$CONTENT" > "$BASE_DIR/$FILE"
}

create_file "achievements.ts" 'import { relations } from "drizzle-orm";
import { achievements } from "../achievements";
import { users } from "../users";

export const achievementsRelations = relations(achievements, ({ one }) => ({
  user: one(users, {
    fields: [achievements.userId],
    references: [users.id],
  }),
}));
'

create_file "analyticsEvents.ts" 'import { relations } from "drizzle-orm";
import { analyticsEvents } from "../analyticsEvents";
import { users } from "../users";

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));
'

create_file "appointments.ts" 'import { relations } from "drizzle-orm";
import { appointments } from "../appointments";
import { clients } from "../clients";
import { serviceProviders } from "../serviceProviders";
import { services } from "../services";

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  client: one(clients, {
    fields: [appointments.clientId],
    references: [clients.id],
  }),
  provider: one(serviceProviders, {
    fields: [appointments.providerId],
    references: [serviceProviders.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
}));
'

create_file "categories.ts" 'import { relations } from "drizzle-orm";
import { categories } from "../categories";
import { services } from "../services";

export const categoriesRelations = relations(categories, ({ many }) => ({
  services: many(services),
}));
'

create_file "clients.ts" 'import { relations } from "drizzle-orm";
import { clients } from "../clients";
import { appointments } from "../appointments";
import { serviceRequests } from "../serviceRequests";
import { conversations } from "../conversations";

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
  serviceRequests: many(serviceRequests),
  conversations: many(conversations),
}));
'

create_file "conversations.ts" 'import { relations } from "drizzle-orm";
import { conversations } from "../conversations";
import { messages } from "../messages";

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages),
}));
'

create_file "creditPurchases.ts" 'import { relations } from "drizzle-orm";
import { creditPurchases } from "../creditPurchases";
import { serviceProviders } from "../serviceProviders";

export const creditPurchasesRelations = relations(creditPurchases, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [creditPurchases.providerId],
    references: [serviceProviders.id],
  }),
}));
'

create_file "messages.ts" 'import { relations } from "drizzle-orm";
import { messages } from "../messages";
import { conversations } from "../conversations";

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));
'

create_file "providerCredits.ts" 'import { relations } from "drizzle-orm";
import { providerCredits } from "../providerCredits";
import { serviceProviders } from "../serviceProviders";

export const providerCreditsRelations = relations(providerCredits, ({ one }) => ({
  provider: one(serviceProviders, {
    fields: [providerCredits.providerId],
    references: [serviceProviders.id],
  }),
}));
'

create_file "providerServices.ts" 'import { relations } from "drizzle-orm";
import { providerServices } from "../providerServices";
import { services } from "../services";
import { serviceProviders } from "../serviceProviders";

export const providerServicesRelations = relations(providerServices, ({ one }) => ({
  service: one(services, {
    fields: [providerServices.serviceId],
    references: [services.id],
  }),
  provider: one(serviceProviders, {
    fields: [providerServices.providerId],
    references: [serviceProviders.id],
  }),
}));
'

create_file "reviews.ts" 'import { relations } from "drizzle-orm";
import { reviews } from "../reviews";
import { clients } from "../clients";
import { serviceProviders } from "../serviceProviders";

export const reviewsRelations = relations(reviews, ({ one }) => ({
  client: one(clients, {
    fields: [reviews.clientId],
    references: [clients.id],
  }),
  provider: one(serviceProviders, {
    fields: [reviews.providerId],
    references: [serviceProviders.id],
  }),
}));
'

create_file "serviceProviders.ts" 'import { relations } from "drizzle-orm";
import { serviceProviders } from "../serviceProviders";
import { appointments } from "../appointments";
import { creditPurchases } from "../creditPurchases";
import { providerCredits } from "../providerCredits";
import { providerMetrics } from "../providerMetrics";
import { providerServices } from "../providerServices";
import { reviews } from "../reviews";
import { serviceRequests } from "../serviceRequests";

export const serviceProvidersRelations = relations(serviceProviders, ({ many }) => ({
  appointments: many(appointments),
  creditPurchases: many(creditPurchases),
  providerCredits: many(providerCredits),
  providerMetrics: many(providerMetrics),
  providerServices: many(providerServices),
  reviews: many(reviews),
  serviceRequests: many(serviceRequests),
}));
'

create_file "services.ts" 'import { relations } from "drizzle-orm";
import { services } from "../services";
import { providerServices } from "../providerServices";
import { categories } from "../categories";

export const servicesRelations = relations(services, ({ many, one }) => ({
  providerServices: many(providerServices),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
}));
'

create_file "serviceRequests.ts" 'import { relations } from "drizzle-orm";
import { serviceRequests } from "../serviceRequests";
import { clients } from "../clients";
import { serviceProviders } from "../serviceProviders";

export const serviceRequestsRelations = relations(serviceRequests, ({ one }) => ({
  client: one(clients, {
    fields: [serviceRequests.clientId],
    references: [clients.id],
  }),
  provider: one(serviceProviders, {
    fields: [serviceRequests.providerId],
    references: [serviceProviders.id],
  }),
}));
'

create_file "users.ts" 'import { relations } from "drizzle-orm";
import { users } from "../users";
import { achievements } from "../achievements";
import { analyticsEvents } from "../analyticsEvents";

export const usersRelations = relations(users, ({ many }) => ({
  achievements: many(achievements),
  analyticsEvents: many(analyticsEvents),
}));
'

