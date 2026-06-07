import { Router } from "express";
import { analysisRouter } from "./analysis.routes.js";
import { testDatabaseConnection } from "../db/pool.js";

export const apiRouter = Router();

apiRouter.get("/health", async (_request, response) => {
  const database = await testDatabaseConnection();
  response.json({
    status: "ok",
    service: "ats-platform-api",
    database,
  });
});

apiRouter.use("/analyses", analysisRouter);
