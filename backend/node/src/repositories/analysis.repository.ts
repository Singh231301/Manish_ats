import { pool } from "../db/pool.js";
import type { AnalysisResult } from "../types/analysis.js";
import { VectorRepository } from "./vector.repository.js";

export class AnalysisRepository {
  constructor(private readonly vectors = new VectorRepository()) {}

  async create(input: {
    userId?: string;
    filename?: string;
    resumeText: string;
    jobDescription?: string;
    result: AnalysisResult;
  }) {
    if (!pool) {
      console.log("[analysis:repository] DATABASE_URL missing; returning in-memory analysis id");
      return { ...input.result, id: crypto.randomUUID() };
    }

    const client = await pool.connect();
    try {
      console.log("[analysis:repository] saving resume, JD, and analysis rows");
      await client.query("begin");

      const resume = await client.query<{ id: string }>(
        `insert into resumes
          (user_id, filename, raw_text, parsed_json, parse_confidence, layout_risk, layout_issues, word_count)
         values ($1, $2, $3, $4, $5, $6, $7, $8)
         returning id`,
        [
          input.userId ?? null,
          input.filename ?? "pasted-resume.txt",
          input.resumeText,
          JSON.stringify(input.result.parsedResume),
          0.9,
          input.result.parsedResume.layoutRisk,
          JSON.stringify(input.result.parsedResume.layoutIssues),
          input.result.parsedResume.wordCount,
        ],
      );

      let jdId: string | null = null;
      if (input.jobDescription) {
        const jd = await client.query<{ id: string }>(
          `insert into job_descriptions (user_id, raw_text, required_skills)
           values ($1, $2, $3)
           returning id`,
          [input.userId ?? null, input.jobDescription, input.result.missingKeywords],
        );
        jdId = jd.rows[0]?.id ?? null;
      }

      const analysis = await client.query<{ id: string }>(
        `insert into analyses
          (user_id, resume_id, jd_id, ats_score, match_score, parse_score, keyword_score,
           semantic_score, format_score, readability_score, missing_keywords, suggestions, heatmap_data,
           ats_target, ats_simulation, ontology_data)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         returning id`,
        [
          input.userId ?? null,
          resume.rows[0]?.id,
          jdId,
          input.result.atsScore,
          input.result.matchScore,
          input.result.parseScore,
          input.result.keywordScore,
          input.result.semanticScore,
          input.result.formatScore,
          input.result.readabilityScore,
          input.result.missingKeywords,
          JSON.stringify(input.result.suggestions),
          JSON.stringify(input.result.heatmapData),
          input.result.atsSimulation?.atsName ?? null,
          JSON.stringify(input.result.atsSimulation ?? {}),
          JSON.stringify(input.result.ontologyData ?? {}),
        ],
      );

      await client.query("commit");
      const resumeId = resume.rows[0]?.id;
      const analysisId = analysis.rows[0]?.id;

      if (resumeId) {
        await this.vectors.store({
          sourceType: "resume",
          sourceId: resumeId,
          userId: input.userId,
          content: input.resumeText,
          metadata: {
            filename: input.filename ?? "pasted-resume.txt",
            analysisId,
            atsScore: input.result.atsScore,
          },
        });
      }

      if (jdId && input.jobDescription) {
        await this.vectors.store({
          sourceType: "job_description",
          sourceId: jdId,
          userId: input.userId,
          content: input.jobDescription,
          metadata: {
            analysisId,
            missingKeywords: input.result.missingKeywords,
          },
        });
      }

      console.log(`[analysis:repository] saved analysis ${analysisId}`);
      return { ...input.result, id: analysisId };
    } catch (error) {
      await client.query("rollback");
      console.error("[analysis:repository] save failed; transaction rolled back");
      throw error;
    } finally {
      client.release();
    }
  }
}
