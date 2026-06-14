import { env } from "../config/env.js";
import type { OptimizeInput } from "../schemas/analysis.schema.js";

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export class GroqService {
  async optimizeResume(input: OptimizeInput) {
    if (!env.groqApiKey) {
      console.warn("[groq] GROQ_API_KEY missing");
      return null;
    }

    console.log(`[groq] request model=${env.groqModel}`);
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.groqApiKey}`,
      },
      body: JSON.stringify({
        model: env.groqModel,
        temperature: 0.25,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an ATS resume optimization assistant. Return strict JSON only. Never invent experience, employers, metrics, degrees, or skills. Improve wording only when it stays truthful.",
          },
          {
            role: "user",
            content: buildPrompt(input),
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Groq request failed: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as GroqChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Groq returned an empty response");
    }

    const parsed = parseGroqJson(content);
    console.log(`[groq] response changes=${parsed.changes.length}`);
    return parsed;
  }

  async extractSkills(resumeText: string): Promise<string[]> {
    if (!env.groqApiKey) {
      console.warn("[groq] GROQ_API_KEY missing for skills extraction");
      return [];
    }

    console.log(`[groq] extracting skills model=${env.groqModel}`);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.groqApiKey}`,
        },
        body: JSON.stringify({
          model: env.groqModel,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are an expert technical recruiter and ATS system. Extract the top 20-30 true professional skills, tools, frameworks, and technologies from the text. Discard generic buzzwords (e.g. 'teamwork', 'hardworking', 'experienced'). Return ONLY a JSON object in this format: { \"skills\": [\"React\", \"Python\", \"Project Management\"] }",
            },
            {
              role: "user",
              content: resumeText.substring(0, 8000), // Prevent context limit issues
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq request failed: ${response.status}`);
      }

      const payload = (await response.json()) as GroqChatResponse;
      const content = payload.choices?.[0]?.message?.content;
      if (!content) return [];

      const parsed = JSON.parse(content) as { skills?: string[] };
      return Array.isArray(parsed.skills) ? parsed.skills : [];
    } catch (e) {
      console.error("[groq] skill extraction failed:", e);
      return [];
    }
  }
}

function buildPrompt(input: OptimizeInput) {
  return JSON.stringify({
    task: "Optimize this resume for ATS matching and recruiter readability.",
    outputShape: {
      optimizedText: "Full improved resume text",
      changes: [
        {
          section: "Section name",
          original: "Original phrase or bullet",
          rewritten: "Improved phrase or bullet",
          reason: "Why this helps ATS/recruiters",
        },
      ],
      keywordsAdded: ["Only keywords that were truthfully added"],
      modelUsed: env.groqModel,
    },
    tone: input.tone,
    resumeText: input.resumeText,
    jobDescription: input.jobDescription ?? "",
    rules: [
      "Do not fabricate metrics.",
      "Do not add skills unless the resume already gives evidence for them.",
      "Prefer action verbs, measurable outcomes, and exact keywords from the job description.",
      "Keep the candidate's facts intact.",
    ],
  });
}

function parseGroqJson(content: string) {
  try {
    const parsed = JSON.parse(content) as {
      optimizedText?: string;
      changes?: unknown[];
      keywordsAdded?: string[];
      modelUsed?: string;
    };

    return {
      optimizedText: parsed.optimizedText ?? "",
      changes: Array.isArray(parsed.changes) ? parsed.changes : [],
      keywordsAdded: Array.isArray(parsed.keywordsAdded) ? parsed.keywordsAdded : [],
      modelUsed: parsed.modelUsed ?? env.groqModel,
    };
  } catch {
    return {
      optimizedText: content,
      changes: [],
      keywordsAdded: [],
      modelUsed: env.groqModel,
    };
  }
}
