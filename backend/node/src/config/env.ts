import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: process.env.DATABASE_URL,
  aiServiceUrl: process.env.AI_SERVICE_URL ?? "http://localhost:8000",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};
