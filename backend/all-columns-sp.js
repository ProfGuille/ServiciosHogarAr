import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const cols = await sql`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'service_providers' 
    ORDER BY ordinal_position
  `;
  console.log('\n📋 TODAS las columnas de service_providers:\n');
  cols.forEach(c => console.log(`  ${c.column_name.padEnd(25)} ${c.data_type}`));
}

check();
