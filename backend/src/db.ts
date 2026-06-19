import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql as drizzleSql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "./shared/schema/index.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL no está definida en las variables de entorno");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4,
});

export const db = drizzle(pool, { schema });

export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await pool.query("SELECT 1");
    return true;
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error);
    return false;
  }
}

import { migrate } from "drizzle-orm/node-postgres/migrator";

export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./migrations" });
    console.log("✅ Migraciones ejecutadas correctamente");
  } catch (error) {
    console.error("❌ Error ejecutando migraciones:", error);
    throw error;
  }
}

// Tagged template sql compatible con neon: await sql`SELECT...` retorna rows[]
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any[]> {
  const query = drizzleSql(strings, ...values);
  const result = await db.execute(query);
  return (result as any).rows ?? (result as any) ?? [];
}

// sql.raw para compatibilidad con Drizzle orderBy/where
sql.raw = (str: string) => drizzleSql.raw(str);
