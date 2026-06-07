import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: "Invalid request payload",
      issues: error.issues,
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  response.status(500).json({ message });
}
