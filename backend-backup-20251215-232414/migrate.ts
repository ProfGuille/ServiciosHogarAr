import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function main() {
  await migrate(db, { migrationsFolder: "./src/migrations" });
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
