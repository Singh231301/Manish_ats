import type { Request, Response } from "express";
import { atsSimulateSchema, heatmapSchema } from "../schemas/ats.schema.js";
import { env } from "../config/env.js";

export class AtsController {
  simulate = async (request: Request, response: Response) => {
    const input = atsSimulateSchema.parse(request.body);
    const res = await fetch(`${env.aiServiceUrl}/ats-simulate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    response.json(await res.json());
  };

  heatmap = async (request: Request, response: Response) => {
    const input = heatmapSchema.parse(request.body);
    const res = await fetch(`${env.aiServiceUrl}/heatmap`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    response.json(await res.json());
  };
}
