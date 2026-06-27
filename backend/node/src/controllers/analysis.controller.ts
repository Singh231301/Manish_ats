import type { Request, Response } from "express";
import { AnalysisService } from "../services/analysis.service.js";
import { createAnalysisSchema, optimizeSchema } from "../schemas/analysis.schema.js";

export class AnalysisController {
  constructor(private readonly service = new AnalysisService()) {}

  create = async (request: Request, response: Response) => {
    try {
      const input = createAnalysisSchema.parse(request.body);
      const result = await this.service.createAnalysis(input);
      response.status(201).json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return response.status(400).json({ error: error.errors[0].message });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  };

  optimize = async (request: Request, response: Response) => {
    try {
      const input = optimizeSchema.parse(request.body);
      const result = await this.service.optimize(input);
      response.json(result);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return response.status(400).json({ error: error.errors[0].message });
      }
      return response.status(500).json({ error: "Internal server error" });
    }
  };
}
