import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import WebSocket from 'ws';
import * as schema from "./shared/schema";

import dotenv from 'dotenv';
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

neonConfig.webSocketConstructor = WebSocket;

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });

