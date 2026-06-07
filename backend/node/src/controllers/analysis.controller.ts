import type { Request, Response } from "express";
import { AnalysisService } from "../services/analysis.service.js";
import { createAnalysisSchema, optimizeSchema } from "../schemas/analysis.schema.js";

export class AnalysisController {
  constructor(private readonly service = new AnalysisService()) {}

  create = async (request: Request, response: Response) => {
    const input = createAnalysisSchema.parse(request.body);
    const result = await this.service.createAnalysis(input);
    response.status(201).json(result);
  };

  optimize = async (request: Request, response: Response) => {
    const input = optimizeSchema.parse(request.body);
    const result = await this.service.optimize(input);
    response.json(result);
  };
}
