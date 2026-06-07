export interface ParsedSection {
  type: "contact" | "summary" | "experience" | "education" | "skills" | "projects" | "unknown";
  title: string;
  content: string;
  confidence: number;
}

export interface ParsedResume {
  rawText: string;
  sections: ParsedSection[];
  skills: string[];
  wordCount: number;
  layoutRisk: "low" | "medium" | "high" | "critical";
  layoutIssues: Array<{
    type: string;
    severity: "medium" | "high" | "critical";
    message: string;
  }>;
}

export interface AnalysisResult {
  id?: string;
  atsScore: number;
  matchScore: number;
  parseScore: number;
  keywordScore: number;
  semanticScore: number;
  formatScore: number;
  readabilityScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  missingKeywords: string[];
  suggestions: Array<{
    category: "formatting" | "keywords" | "readability" | "structure";
    title: string;
    impact: number;
    detail: string;
  }>;
  heatmapData: Array<{
    section: string;
    score: number;
    status: "strong" | "warning" | "weak";
  }>;
  parsedResume: ParsedResume;
}
