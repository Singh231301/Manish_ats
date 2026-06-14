export interface ParsedSection {
  type: "contact" | "summary" | "experience" | "education" | "skills" | "projects" | "unknown";
  title: string;
  content: string;
  confidence: number;
}

export interface ParsedResume {
  rawText: string;
  sections: Array<{
    type: string;
    title: string;
    content: string;
    confidence: number;
  }>;
  skills: string[];
  wordCount: number;
  layoutRisk: "low" | "medium" | "high" | "critical";
  layoutIssues: Array<{
    type: string;
    severity: string;
    message: string;
  }>;
}

export interface HeatmapZone {
  section: string;
  page: number;
  position: string;
  attention_weight: number;
  keyword_density: number;
  visibility_score: number;
  status: "strong" | "warning" | "weak";
}

export interface OntologyMatch {
  matched: string[];
  partial_matched: { skill: string; matched_via: string }[];
  missing: string[];
  match_score: number;
}

export interface ATSSimulationResult {
  atsName: string;
  simulatedText: string;
  compatibilityScore: number;
  issuesFlagged: string[];
}

export interface Suggestion {
  category: "formatting" | "keywords" | "readability" | "structure";
  title: string;
  impact: number;
  detail: string;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  resumeId?: string;
  jdId?: string;
  atsScore: number;
  matchScore: number;
  parseScore: number;
  keywordScore: number;
  semanticScore: number;
  formatScore: number;
  readabilityScore: number;
  grade?: "A" | "B" | "C" | "D" | "F";
  missingKeywords: string[];
  suggestions: Suggestion[];
  heatmapData: HeatmapZone[];
  parsedResume: ParsedResume;
  ontologyData?: OntologyMatch;
  atsSimulation?: ATSSimulationResult;
}
