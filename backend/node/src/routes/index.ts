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

import { requireAuth } from "../middleware/auth.js";

apiRouter.use("/analyses", requireAuth, analysisRouter);
apiRouter.use("/search", requireAuth, searchRouter);
apiRouter.use("/ats", requireAuth, atsRouter);
apiRouter.use("/ontology", requireAuth, ontologyRouter);
apiRouter.use("/upload", requireAuth, uploadRouter);
apiRouter.use("/stream", requireAuth, sseRouter);
