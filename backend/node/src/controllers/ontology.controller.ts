import type { Request, Response } from "express";
import { ontologyExpandSchema, ontologyMatchSchema } from "../schemas/ats.schema.js";
import { env } from "../config/env.js";

export class OntologyController {
  expand = async (request: Request, response: Response) => {
    const input = ontologyExpandSchema.parse(request.body);
    const res = await fetch(`${env.aiServiceUrl}/ontology/expand`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input.skills),
    });
    response.json(await res.json());
  };

  match = async (request: Request, response: Response) => {
    const input = ontologyMatchSchema.parse(request.body);
    const res = await fetch(`${env.aiServiceUrl}/ontology/match`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    response.json(await res.json());
  };
}
