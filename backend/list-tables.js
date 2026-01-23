import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function listTables() {
  try {
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;
    console.log('\n📊 Tablas existentes en Neon:\n');
    tables.forEach(t => console.log('  -', t.tablename));
    console.log('\n✅ Total:', tables.length, 'tablas');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listTables();
