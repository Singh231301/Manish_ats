import type { NextFunction, Request, Response } from "express";

export function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();
  console.log(`[request:start] ${request.method} ${request.originalUrl}`);

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(
      `[request:end] ${request.method} ${request.originalUrl} ${response.statusCode} ${durationMs}ms`,
    );
  });

  next();
}
