import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  schema: [
    "./src/shared/schema/serviceProviders.ts",
    "./src/shared/schema/providerServices.ts",
    "./src/shared/schema/reviews.ts",
    "./src/shared/schema/serviceRequests.ts",
    "./src/shared/schema/providerCredits.ts",
    "./src/shared/schema/providerLocations.ts",
    "./src/shared/schema/leadResponses.ts",
    "./src/shared/schema/users.ts",
    "./src/shared/schema/payments.ts",
    "./src/shared/schema/analyticsEvents.ts",
    "./src/shared/schema/messages.ts",
    "./src/shared/schema/conversations.ts",
    "./src/shared/schema/creditPurchases.ts",
    "./src/shared/schema/referrals.ts",
    "./src/shared/schema/languages.ts",
    "./src/shared/schema/categories.ts",
    "./src/shared/schema/appointments.ts",
    "./src/shared/schema/translations.ts",
    "./src/shared/schema/notifications.ts",
    "./src/shared/schema/pushSubscriptions.ts",
    "./src/shared/schema/providerAvailability.ts",
  ],
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
});
