import { Router } from "express";
import { SearchController } from "../controllers/search.controller.js";

const router = Router();
const controller = new SearchController();

router.post("/semantic", controller.semantic);

export { router as searchRouter };
