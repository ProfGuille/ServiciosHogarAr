import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./shared/schema/index.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

let sql: ReturnType<typeof neon>;

try {
  sql = neon(DATABASE_URL);
} catch (error) {
  console.error("❌ Error al crear cliente Neon:", error);
  throw error;
}

export const db = drizzle(sql, { schema });

export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await sql('SELECT 1');
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    return false;
  }
}

import { migrate } from "drizzle-orm/neon-http/migrator";

export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migraciones ejecutadas correctamente");
  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
    throw error;
  }
}

// Exportar sql para queries directos (necesario para operaciones atómicas)
export { sql };
