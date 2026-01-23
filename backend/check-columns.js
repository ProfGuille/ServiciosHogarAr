import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_providers'
      ORDER BY ordinal_position
    `;
    console.log('\n📋 Columnas de service_providers:\n');
    columns.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkColumns();
