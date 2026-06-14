import { Router } from "express";
import { AtsController } from "../controllers/ats.controller.js";

const router = Router();
const controller = new AtsController();

router.post("/simulate", controller.simulate);
router.post("/heatmap", controller.heatmap);

export { router as atsRouter };
