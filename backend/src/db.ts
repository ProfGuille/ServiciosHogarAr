// backend/src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./shared/schema/index.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida. El backend no puede iniciar.");
  process.exit(1);
}

let sql;
let db;

try {
  sql = neon(DATABASE_URL);
  db = drizzle(sql, { schema });

  console.log("✅ Conexión a la base de datos inicializada correctamente");
} catch (err) {
  console.error("❌ Error inicializando la base de datos:", err);
  process.exit(1);
}

export { db, sql };

// -----------------------------
// MIGRACIONES (solo manuales)
// -----------------------------
import { migrate } from "drizzle-orm/neon-http/migrator";

export async function runMigrations() {
  try {
    console.log("🚀 Ejecutando migraciones...");
    await migrate(db, { migrationsFolder: "migrations" });
    console.log("✅ Migraciones completadas");
  } catch (err) {
    console.error("❌ Error ejecutando migraciones:", err);

    // Errores comunes de objetos ya existentes
    const allowed = ["42710", "42P07", "42P16"];
    const code = err?.code || err?.cause?.code;

    if (allowed.includes(code)) {
      console.warn("⚠️ Migraciones ya aplicadas. Continuando...");
      return true;
    }

    if (process.env.NODE_ENV === "production") {
      console.warn("⚠️ Error en migraciones en producción. Continuando con el schema existente.");
      return true;
    }

    return false;
  }
}

export function isDatabaseAvailable() {
  return Boolean(db);
}

