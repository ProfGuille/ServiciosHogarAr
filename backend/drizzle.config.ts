// backend/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
schema: './src/shared/schema/*.ts',

  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});

