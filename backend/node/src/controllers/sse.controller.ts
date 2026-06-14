import type { Request, Response } from "express";
import { env } from "../config/env.js";

export class SseController {
  stream = async (request: Request, response: Response) => {
    const { taskId } = request.params;
    if (!taskId) {
      return response.status(400).end();
    }

    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Connection", "keep-alive");

    try {
      const res = await fetch(`${env.aiServiceUrl}/stream/${taskId}`);
      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        response.write(decoder.decode(value));
      }
    } catch (error) {
      console.error("[sse] Error proxying stream", error);
      response.write(`data: {"status": "failed", "error": "stream proxy error"}\n\n`);
    } finally {
      response.end();
    }
  };
}
