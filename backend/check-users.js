import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function check() {
  const cols = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'users' ORDER BY ordinal_position
  `;
  console.log('Columnas users:', cols.map(c => c.column_name).join(', '));
  
  const colsPL = await sql`
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = 'provider_locations' ORDER BY ordinal_position
  `;
  console.log('Columnas provider_locations:', colsPL.map(c => c.column_name).join(', '));
}

check();
