import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { logger } from '../logging/logger.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', (client) => {
  void client.query('SET statement_timeout = 30000');
});

pool.on('error', (err) => {
  logger.error({ err }, 'Database pool error');
});

logger.info('Database pool created');

export const db = drizzle({ client: pool });

export async function closeDb() {
  await pool.end();
  logger.info('Database pool closed');
}
