import type { Request, Response } from "express";
import { semanticSearchSchema } from "../schemas/search.schema.js";
import { SearchService } from "../services/search.service.js";

export class SearchController {
  constructor(private readonly service = new SearchService()) {}

  semantic = async (request: Request, response: Response) => {
    const input = semanticSearchSchema.parse(request.body);
    const results = await this.service.semanticSearch(input);
    response.json({ results });
  };
}
