import { AnalysisResult } from "../types/analysis.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface AnalyzePayload {
  resumeText: string;
  jobDescription?: string;
  targetRole?: string;
}

export const api = {
  getHeaders() {
    // In a real app, retrieve from secure store or cookie
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    };
  },

  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    
    // For FormData, do not set content-type header
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(errData.message || "Upload failed");
    }
    return res.json();
  },

  async analyze(payload: AnalyzePayload): Promise<AnalysisResult> {
    const response = await fetch(`${API_URL}/analyses`, {
      method: "POST",
      headers: this.getHeaders(),
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
