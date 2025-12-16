// backend/src/db.ts
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables are now loaded from index.ts with 'dotenv/config'
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

// Function to log migration errors to file
function logMigrationError(error: any) {
  const timestamp = new Date().toISOString();
  let logEntry = `[${timestamp}] MIGRATION ERROR: ${error.message || error}\n`;
  
  if (error.stack) {
    logEntry += `Stack trace: ${error.stack}\n`;
  }
  
  logEntry += `---\n`;
  
  try {
    // Ensure logs directory exists
    const logsDir = path.resolve(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Write to db migration errors log file
    const logFile = path.join(logsDir, 'db_migration_errors.log');
    fs.appendFileSync(logFile, logEntry);
    
    console.log(`Migration error logged to: ${logFile}`);
  } catch (logError) {
    console.error('Failed to write migration error to log file:', logError);
  }
}

export async function runMigrations() {
  if (!db) {
    console.warn('Cannot run migrations: database connection not available');
    return false;
  }
  
  try {
    console.log('Ejecutando migraciones...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error: any) {
    console.error('Error running migrations:', error);
    
    // Check if error is related to constraint already existing (specific handling for the issue mentioned)
    if (error.code === '42710' || (error?.cause?.code === '42710')) {
      console.log('✅ Database migrations: Constraints/objects already exist (expected in production)');
      console.log(`   Detected code 42710 - continuing with existing schema`);
      return true; // Continue startup as this is not critical
    }
    
    // Check if error is related to table or constraint already existing
    if (error?.cause?.code === '42P07' || // relation already exists
        error?.cause?.code === '42P16' || // constraint already exists  
        error?.message?.includes('already exists')) {
      console.log('✅ Database migrations: Schema objects already exist (expected in production)');
      console.log('   Continuing with existing schema...');
      return true; // Return true as this is not a critical error
    }
    
    // Log the error to file for debugging
    logMigrationError(error);
    
    // For production deployments, continue even if migrations fail partially
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️  Migration errors detected in production. Continuing with existing schema...');
      console.warn('   This may indicate schema drift. Check logs for details.');
      return true; // Continue in production to avoid deployment failures
    }
    
    return false;
  }
}

export function isDatabaseAvailable(): boolean {
  return db !== null;
}

