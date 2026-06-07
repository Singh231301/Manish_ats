import { pool } from "../db/pool.js";
import type { AnalysisResult } from "../types/analysis.js";

export class AnalysisRepository {
  async create(input: {
    userId?: string;
    filename?: string;
    resumeText: string;
    jobDescription?: string;
    result: AnalysisResult;
  }) {
    if (!pool) {
      return { ...input.result, id: crypto.randomUUID() };
    }

    const client = await pool.connect();
    try {
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
           semantic_score, format_score, readability_score, missing_keywords, suggestions, heatmap_data)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
        ],
      );

      await client.query("commit");
      return { ...input.result, id: analysis.rows[0]?.id };
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
}
