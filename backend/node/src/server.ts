import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initializeDatabase } from "./db/pool.js";

const app = createApp();

async function bootstrap() {
  await initializeDatabase();

  app.listen(env.port, () => {
    console.log(`ATS Platform API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start ATS Platform API");
  console.error(error);
  process.exit(1);
});
