import { pool } from "./src/db/pool.js";

async function main() {
  if (!pool) {
    console.error("No pool found");
    return;
  }
  try {
    await pool.query(`
      ALTER TABLE analyses 
      ADD COLUMN IF NOT EXISTS ats_target TEXT,
      ADD COLUMN IF NOT EXISTS ats_simulation JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS ontology_data JSONB DEFAULT '{}'::jsonb;
    `);
    console.log("Altered analyses table successfully");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await pool.end();
  }
}

main();
