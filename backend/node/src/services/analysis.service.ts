import { env } from "../config/env.js";
import { AnalysisRepository } from "../repositories/analysis.repository.js";
import type { CreateAnalysisInput, OptimizeInput } from "../schemas/analysis.schema.js";
import { GroqService } from "./groq.service.js";
import type { AnalysisResult, ParsedResume } from "../types/analysis.js";
import { parseResumeText } from "../utils/resume-parser.js";
import { scoreResume } from "../utils/score.js";

export class AnalysisService {
  constructor(
    private readonly repository = new AnalysisRepository(),
    private readonly groq = new GroqService(),
  ) {}

  async createAnalysis(input: CreateAnalysisInput): Promise<AnalysisResult> {
    console.log("[analysis:create] started");
    
    // Parse
    const parsedResume = await this.parseWithAiFallback(input.resumeText);
    
    // Extract smart skills using Groq if possible
    const smartSkills = await this.groq.extractSkills(parsedResume.rawText);
    if (smartSkills.length > 0) {
      parsedResume.skills = smartSkills;
      console.log(`[analysis:create] extracted ${smartSkills.length} smart skills`);
    }

    // Score
    const scoredRes = await fetch(`${env.aiServiceUrl}/score`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText: input.resumeText, jobDescription: input.jobDescription })
    });
    const scored = await scoredRes.json();
    
    // Generate Suggestions Deterministically if none exist
    if (!scored.suggestions || scored.suggestions.length === 0) {
      scored.suggestions = [];
      if (scored.parseScore < 90) {
        scored.suggestions.push({
          category: "Parsing",
          title: "Improve ATS Parsing Formatting",
          detail: "Your resume layout had issues being parsed. Ensure you use standard section headers and single-column text."
        });
      }
      if (scored.keywordScore < 80 && input.jobDescription) {
        scored.suggestions.push({
          category: "Keywords",
          title: "Missing Critical Keywords",
          detail: "Add missing exact keywords from the job description to improve keyword density."
        });
      }
      if (parsedResume.skills.length < 10) {
        scored.suggestions.push({
          category: "Skills",
          title: "Add More Technical Skills",
          detail: "We detected fewer than 10 hard skills. Explicitly list out all your relevant tools and frameworks."
        });
      }
      if (scored.suggestions.length === 0) {
        scored.suggestions.push({
          category: "Optimization",
          title: "Metrics & Outcomes",
          detail: "Ensure all bullet points include quantifiable metrics to stand out to recruiters."
        });
      }
    }
    
    // Heatmap
    const heatmapRes = await fetch(`${env.aiServiceUrl}/heatmap`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ resumeText: input.resumeText, jobDescription: input.jobDescription })
    });
    const heatmap = await heatmapRes.json();
    
    // Ontology
    let ontologyData = undefined;
    if (input.jobDescription) {
      const jdSkills = input.jobDescription.split(" "); // highly simplified
      const ontologyRes = await fetch(`${env.aiServiceUrl}/ontology/match`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeSkills: parsedResume.skills, jdSkills: jdSkills })
      });
      ontologyData = await ontologyRes.json();
    }
    
    // ATS Simulation if requested
    let atsSimulation = undefined;
    if (input.targetRole) {
      const atsRes = await fetch(`${env.aiServiceUrl}/ats-simulate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ resumeText: input.resumeText, atsTarget: "workday" }) // default to workday
      });
      atsSimulation = await atsRes.json();
    }

    const result: AnalysisResult = { 
      ...scored, 
      parsedResume, 
      heatmapData: heatmap.zones,
      ontologyData,
      atsSimulation
    };

    const saved = await this.repository.create({
      userId: input.userId,
      filename: input.filename,
      resumeText: input.resumeText,
      jobDescription: input.jobDescription,
      result,
    });
    console.log(`[analysis:create] complete id=${saved.id}`);
    return saved;
  }

  async optimize(input: OptimizeInput) {
    console.log("[analysis:optimize] started");
    try {
      const groqResult = await this.groq.optimizeResume(input);
      if (groqResult) {
        console.log(`[analysis:optimize] Groq complete model=${groqResult.modelUsed}`);
        return groqResult;
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown Groq error";
      console.warn(`[analysis:optimize] Groq skipped: ${reason}`);
      // Continue through the AI service/local fallback if Groq is unavailable.
    }

    try {
      console.log("[analysis:optimize] trying Python AI service");
      const response = await fetch(`${env.aiServiceUrl}/optimize`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });

      if (response.ok) {
        console.log("[analysis:optimize] Python AI service complete");
        return response.json();
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown Python AI error";
      console.warn(`[analysis:optimize] Python AI skipped: ${reason}`);
      // Fall back to deterministic local suggestions while the AI service is offline.
    }

    console.log("[analysis:optimize] using local fallback");
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
      console.log("[analysis:parse] trying Python AI service");
      const response = await fetch(`${env.aiServiceUrl}/parse`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: resumeText }),
      });

      if (response.ok) {
        const payload = (await response.json()) as { parsedResume?: ParsedResume };
        if (payload.parsedResume) {
          console.log("[analysis:parse] Python AI service complete");
          return payload.parsedResume;
        }
      }
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown Python parse error";
      console.warn(`[analysis:parse] Python AI skipped: ${reason}`);
      // Local parser keeps the API usable without Python running.
    }

    console.log("[analysis:parse] using local parser");
    return parseResumeText(resumeText);
  }
}
