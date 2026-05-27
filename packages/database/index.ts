import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env";

// Automatically configure SSL for remote databases (like Render or Neon)
const isRemote = env.DATABASE_URL.includes("render.com") || env.DATABASE_URL.includes("neon.tech");

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  ssl: isRemote ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool);
export * from "drizzle-orm";
export default db;
