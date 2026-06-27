import { sequelize } from "./models.js";
import { env } from "../config/env.js";

// We still export pool for backward compatibility if needed, but it's null
// since we migrated to Sequelize. Services using raw pool will need refactoring eventually,
// but for now, we just export sequelize.
export const pool = null;

export async function testDatabaseConnection() {
  if (!env.databaseUrl) {
    return { connected: false, reason: "DATABASE_URL is not configured" };
  }

  try {
    await sequelize.authenticate();
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      reason: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}

export async function initializeDatabase() {
  if (!env.databaseUrl) {
    console.warn("DATABASE_URL is not configured; database initialization skipped.");
    return;
  }

  try {
    // This handles all migrations for free without writing explicit SQL files.
    // It compares the models to the DB schema and alters tables as needed.
    await sequelize.sync({  alter: true });
    console.log("Database schema is ready (Sequelize alter:true).");

    // Try to enable pgvector and pg_trgm extensions
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm";`);
    await sequelize.query(`CREATE EXTENSION IF NOT EXISTS "vector";`);
    console.log("PostgreSQL extensions ready.");
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown initialization error";
    console.warn("Database initialization encountered an error.");
    console.warn(reason);
  }
}
