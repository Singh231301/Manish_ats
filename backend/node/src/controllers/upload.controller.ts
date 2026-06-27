import type { Request, Response } from "express";
import { env } from "../config/env.js";

export class UploadController {
  upload = async (request: Request, response: Response) => {
    if (!request.file) {
      return response.status(400).json({ message: "No file uploaded" });
    }

    const formData = new FormData();
    const blob = new Blob([request.file.buffer], { type: request.file.mimetype });
    formData.append("file", blob, request.file.originalname);

    try {
      const res = await fetch(`${env.aiServiceUrl}/parse-file`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return response.status(res.status).json({ message: errorData.detail || `Python AI upload failed: ${res.status}` });
      }

      return response.json(await res.json());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown upload error";
      response.status(500).json({ message });
    }
  };
}
