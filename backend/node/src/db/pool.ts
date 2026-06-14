import pg from "pg";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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

export async function initializeDatabase() {
  if (!pool) {
    console.warn("DATABASE_URL is not configured; database initialization skipped.");
    return;
  }

  const schemaPath = join(dirname(fileURLToPath(import.meta.url)), "schema.sql");
  const schema = await readFile(schemaPath, "utf-8");
  await pool.query(schema);
  console.log("Database schema is ready.");

  try {
    const vectorSchemaPath = join(dirname(fileURLToPath(import.meta.url)), "vector-schema.sql");
    const vectorSchema = await readFile(vectorSchemaPath, "utf-8");
    await pool.query(vectorSchema);
    console.log("pgvector schema is ready.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown pgvector setup error";
    console.warn("pgvector schema skipped. Install the PostgreSQL pgvector extension to enable semantic search.");
    console.warn(reason);
  }
}
