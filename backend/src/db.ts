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
  console.warn('⚠️  DATABASE_URL no está definida. El servidor funcionará en modo limitado sin base de datos.');
  console.warn('   Para funcionalidad completa, configura DATABASE_URL en Render.');
}

import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import { neon } from '@neondatabase/serverless';
import * as schema from "./shared/schema/index.js"; // importá TODO el schema aquí

let sql: any = null;
let db: any = null;

// Initialize database connection if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
    console.log('✅ Database connection initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database connection:', error);
    console.warn('   El servidor funcionará en modo limitado sin base de datos.');
  }
} else {
  console.warn('⚠️  Database not available - running in limited mode');
}

export { db };

export async function runMigrations() {
  if (!db) {
    console.warn('Cannot run migrations: database connection not available');
    return false;
  }
  
  try {
    console.log('Ejecutando migraciones...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('Migraciones completadas.');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    
    // Check if error is due to tables already existing
    const errorMessage = error instanceof Error ? error.message : String(error);
    const causeMessage = error instanceof Error && (error as any).cause instanceof Error ? (error as any).cause.message : '';
    
    if (errorMessage.includes('already exists') || 
        causeMessage.includes('already exists') ||
        (error as any)?.code === '42P07') {
      console.warn('⚠️  Some tables already exist - this is normal for existing databases');
      console.log('✅ Continuing with existing schema');
      return true; // Consider this a success since schema exists
    }
    
    return false;
  }
}

export function isDatabaseAvailable(): boolean {
  return db !== null;
}

export async function checkTableExists(tableName: string): Promise<boolean> {
  if (!db) {
    return false;
  }
  
  try {
    // Query information_schema to check if table exists
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = '${tableName}'
      );
    `);
    
    return result.rows?.[0]?.exists === true;
  } catch (error) {
    console.warn(`⚠️  Could not check if table '${tableName}' exists:`, error);
    return false;
  }
}

export async function areRequiredTablesReady(): Promise<boolean> {
  if (!db) {
    return false;
  }
  
  const requiredTables = ['appointments', 'notifications', 'service_requests', 'users', 'service_providers'];
  
  try {
    for (const table of requiredTables) {
      const exists = await checkTableExists(table);
      if (!exists) {
        console.warn(`⚠️  Required table '${table}' does not exist yet`);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.warn('⚠️  Could not verify required tables:', error);
    return false;
  }
}

