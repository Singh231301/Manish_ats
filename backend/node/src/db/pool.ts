import pg from "pg";
import { env } from "../config/env.js";

export const pool = env.databaseUrl
  ? new pg.Pool({
      connectionString: env.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  : null;

export async function testDatabaseConnection() {
  if (!pool) {
    return { connected: false, reason: "DATABASE_URL is not configured" };
  }

  try {
    await pool.query("select 1");
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      reason: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
