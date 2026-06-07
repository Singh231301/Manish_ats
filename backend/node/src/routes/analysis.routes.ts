import { Router } from "express";
import { AnalysisController } from "../controllers/analysis.controller.js";

const router = Router();
const controller = new AnalysisController();

router.post("/", controller.create);
router.post("/optimize", controller.optimize);

export { router as analysisRouter };
