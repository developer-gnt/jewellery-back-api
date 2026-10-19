import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const client = new pg.Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'zewar_mahal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'Root',
});

async function run() {
  await client.connect();
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS "UQ_shop_rates_metal_purity_active"
    ON "shop_rates" (LOWER("metal"), UPPER("purity"))
    WHERE "isActive" = true;
  `);
  console.log('Unique index on shop_rates verified/created successfully!');
  await client.end();
}

run().catch(err => {
  console.error('Failed to create index:', err);
  process.exit(1);
});
