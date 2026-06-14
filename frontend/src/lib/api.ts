import { AnalysisResult } from "../types/analysis.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface AnalyzePayload {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
}

export const api = {
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  },

  async analyze(payload: AnalyzePayload): Promise<AnalysisResult> {
    const response = await fetch(`${API_URL}/analyses`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Analysis failed" }));
      throw new Error(error.message ?? "Analysis failed");
    }

    return response.json();
  },
};

// Kept for backward compatibility if used directly
export async function createAnalysis(payload: AnalyzePayload): Promise<AnalysisResult> {
  return api.analyze(payload);
}

export async function optimizeResume(payload: AnalyzePayload & { tone?: "direct" | "executive" | "technical" }) {
  const response = await fetch(`${API_URL}/analyses/optimize`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      resumeText: payload.resumeText,
      jobDescription: payload.jobDescription,
      tone: payload.tone ?? "direct",
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Optimization failed" }));
    throw new Error(error.message ?? "Optimization failed");
  }

  return response.json() as Promise<{
    optimizedText: string;
    changes: Array<{
      section?: string;
      original?: string;
      rewritten?: string;
      reason?: string;
      recommendation?: string;
    }>;
    keywordsAdded?: string[];
    modelUsed: string;
  }>;
}
