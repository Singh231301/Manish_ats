import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const controller = new UploadController();

router.post("/", upload.single("file"), controller.upload);

export { router as uploadRouter };
