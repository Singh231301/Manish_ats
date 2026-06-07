import type { AnalysisResult } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface AnalyzePayload {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
}

export async function createAnalysis(payload: AnalyzePayload): Promise<AnalysisResult> {
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
}
