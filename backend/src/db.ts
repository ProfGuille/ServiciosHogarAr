// backend/src/db.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try different .env file locations
const envPaths = [
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env')
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
  if (process.env.DATABASE_URL) break;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno. Verifica la configuración en Render.');
}

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as schema from "./shared/schema/index.js"; // importá TODO el schema aquí

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export async function runMigrations() {
  console.log('Ejecutando migraciones...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migraciones completadas.');
}

