// backend/src/db.ts
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el archivo .env');
}

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as schema from './shared/schema'; // importá TODO el schema aquí

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });

export async function runMigrations() {
  console.log('Ejecutando migraciones...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migraciones completadas.');
}

