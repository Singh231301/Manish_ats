import { Router } from "express";
import { analysisRouter } from "./analysis.routes.js";
import { searchRouter } from "./search.routes.js";
import { atsRouter } from "./ats.routes.js";
import { ontologyRouter } from "./ontology.routes.js";
import { uploadRouter } from "./upload.routes.js";
import { sseRouter } from "./sse.routes.js";
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
apiRouter.use("/search", searchRouter);
apiRouter.use("/ats", atsRouter);
apiRouter.use("/ontology", ontologyRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/stream", sseRouter);
