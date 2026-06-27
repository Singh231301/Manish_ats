import { Router } from "express";
import multer from "multer";
import { UploadController } from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/jpeg",
      "image/png"
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, DOC, JPEG, and PNG are allowed."));
    }
  }
});

const controller = new UploadController();

router.post("/", upload.single("file"), controller.upload);

export { router as uploadRouter };
