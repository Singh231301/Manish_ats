import type { LayoutRisk, ParsedResume, ParsedSection } from "../types/analysis.js";

const SECTION_ALIASES: Record<string, ParsedSection["type"]> = {
  summary: "summary",
  profile: "summary",
  objective: "summary",
  experience: "experience",
  "work experience": "experience",
  "professional experience": "experience",
  education: "education",
  skills: "skills",
  "technical skills": "skills",
  projects: "projects",
};

const SKILL_ALIASES: Record<string, string> = {
  aws: "AWS",
  "amazon web services": "AWS",
  gcp: "Google Cloud Platform",
  azure: "Azure",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  react: "React",
  nextjs: "Next.js",
  "next.js": "Next.js",
  node: "Node.js",
  "node.js": "Node.js",
  python: "Python",
  java: "Java",
  sql: "SQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  fastapi: "FastAPI",
  express: "Express",
  redis: "Redis",
  microservices: "Microservices",
  "machine learning": "Machine Learning",
  ml: "Machine Learning",
  nlp: "Natural Language Processing",
  ci: "CI/CD",
  "ci/cd": "CI/CD",
};

export function parseResumeText(rawText: string): ParsedResume {
  const normalized = rawText.replace(/\r\n/g, "\n").trim();
  const lines = normalized.split("\n");
  const sections: ParsedSection[] = [];
  let currentTitle = "Profile";
  let currentType: ParsedSection["type"] = "summary";
  let buffer: string[] = [];

  const flush = () => {
    const content = buffer.join("\n").trim();
    if (content.length > 0) {
      sections.push({
        type: currentType,
        title: currentTitle,
        content,
        confidence: currentType === "unknown" ? 0.55 : 0.88,
      });
    }
    buffer = [];
  };

  for (const line of lines) {
    const clean = line.trim();
    const key = clean.toLowerCase().replace(/[:\-]+$/g, "");
    const isHeader =
      clean.length <= 48 &&
      (SECTION_ALIASES[key] ||
        /^[A-Z][A-Z\s/&]{2,40}$/.test(clean) ||
        /^[A-Z][a-zA-Z\s/&]{2,40}:$/.test(clean));

    if (isHeader) {
      flush();
      currentTitle = clean.replace(/:$/, "");
      currentType = SECTION_ALIASES[key] ?? "unknown";
    } else {
      buffer.push(line);
    }
  }
  flush();

  const skills = extractSkills(normalized);
  const layoutIssues = detectLayoutIssues(normalized);
  const layoutRisk = getLayoutRisk(layoutIssues);

  return {
    rawText: normalized,
    sections,
    skills,
    wordCount: normalized.split(/\s+/).filter(Boolean).length,
    layoutRisk,
    layoutIssues,
  };
}

export function extractSkills(text: string) {
  const found = new Set<string>();
  const lower = text.toLowerCase();

  for (const [alias, canonical] of Object.entries(SKILL_ALIASES)) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (new RegExp(`\\b${escaped}\\b`, "i").test(lower)) {
      found.add(canonical);
    }
  }

  return Array.from(found).sort();
}

function detectLayoutIssues(text: string) {
  const issues: ParsedResume["layoutIssues"] = [];

  if (/\|\s*\w+/.test(text) || /\t{2,}/.test(text)) {
    issues.push({
      type: "tables",
      severity: "high",
      message: "Table-like text detected. Convert tables into plain one-column bullet lists.",
    });
  }

  if (/text box|two column|2-column/i.test(text)) {
    issues.push({
      type: "layout",
      severity: "critical",
      message: "Potential multi-column or text-box layout mentioned. ATS systems often scramble this content.",
    });
  }

  if (!/@/.test(text)) {
    issues.push({
      type: "contact",
      severity: "medium",
      message: "No email address detected in resume text.",
    });
  }

  return issues;
}

function getLayoutRisk(issues: ParsedResume["layoutIssues"]): LayoutRisk {
  if (issues.some((issue) => issue.severity === "critical")) return "critical";
  if (issues.some((issue) => issue.severity === "high")) return "high";
  if (issues.length > 0) return "medium";
  return "low";
}
