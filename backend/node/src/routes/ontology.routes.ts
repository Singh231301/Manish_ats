import { Router } from "express";
import { OntologyController } from "../controllers/ontology.controller.js";

const router = Router();
const controller = new OntologyController();

router.post("/expand", controller.expand);
router.post("/match", controller.match);

export { router as ontologyRouter };
