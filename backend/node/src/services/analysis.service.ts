import { env } from "../config/env.js";
import { AnalysisRepository } from "../repositories/analysis.repository.js";
import type { CreateAnalysisInput, OptimizeInput } from "../schemas/analysis.schema.js";
import type { AnalysisResult, ParsedResume } from "../types/analysis.js";
import { parseResumeText } from "../utils/resume-parser.js";
import { scoreResume } from "../utils/score.js";

export class AnalysisService {
  constructor(private readonly repository = new AnalysisRepository()) {}

  async createAnalysis(input: CreateAnalysisInput): Promise<AnalysisResult> {
    const parsedResume = await this.parseWithAiFallback(input.resumeText);
    const scored = scoreResume(parsedResume, input.jobDescription);
    const result: AnalysisResult = { ...scored, parsedResume };

    return this.repository.create({
      userId: input.userId,
      filename: input.filename,
      resumeText: input.resumeText,
      jobDescription: input.jobDescription,
      result,
    });
  }

  async optimize(input: OptimizeInput) {
    try {
      const response = await fetch(`${env.aiServiceUrl}/optimize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      // Fall back to deterministic local suggestions while the AI service is offline.
    }

    const parsedResume = parseResumeText(input.resumeText);
    const scored = scoreResume(parsedResume, input.jobDescription);
    return {
      optimizedText: input.resumeText,
      changes: scored.suggestions.map((suggestion) => ({
        section: suggestion.category,
        reason: suggestion.detail,
        recommendation: suggestion.title,
      })),
      modelUsed: "local-fallback",
    };
  }

  private async parseWithAiFallback(resumeText: string): Promise<ParsedResume> {
    try {
      const response = await fetch(`${env.aiServiceUrl}/parse`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { parsedResume?: ParsedResume };
        if (payload.parsedResume) return payload.parsedResume;
      }
    } catch {
      // Local parser keeps the API usable without Python running.
    }

    return parseResumeText(resumeText);
  }
}
