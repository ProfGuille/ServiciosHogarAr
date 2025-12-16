// src/db.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { Pool } from '@neondatabase/serverless';
import * as schema from './shared/schema'; // importa todo el schema desde index.ts
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en el archivo .env');
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export async function runMigrations() {
  console.log('Ejecutando migraciones...');
  await migrate(db, { migrationsFolder: 'drizzle' });
  console.log('Migraciones completadas.');
}

