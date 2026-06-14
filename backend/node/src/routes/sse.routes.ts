import { Router } from "express";
import { SseController } from "../controllers/sse.controller.js";

const router = Router();
const controller = new SseController();

router.get("/:taskId", controller.stream);

export { router as sseRouter };
