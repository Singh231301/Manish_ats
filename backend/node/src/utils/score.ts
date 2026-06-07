import type { AnalysisResult, ParsedResume } from "../types/analysis.js";
import { extractSkills } from "./resume-parser.js";

const STRONG_VERBS = new Set([
  "led",
  "built",
  "launched",
  "drove",
  "reduced",
  "increased",
  "scaled",
  "designed",
  "created",
  "managed",
  "architected",
  "deployed",
]);

export function scoreResume(parsedResume: ParsedResume, jobDescription?: string): Omit<AnalysisResult, "parsedResume"> {
  const parseScore = computeParseScore(parsedResume);
  const formatScore = computeFormatScore(parsedResume);
  const keywordScore = computeKeywordScore(parsedResume, jobDescription);
  const semanticScore = computeSemanticScore(parsedResume.rawText, jobDescription);
  const readabilityScore = computeReadabilityScore(parsedResume);

  const atsScore =
    parseScore * 0.25 +
    formatScore * 0.2 +
    keywordScore * 0.25 +
    semanticScore * 0.2 +
    readabilityScore * 0.1;

  const missingKeywords = getMissingKeywords(parsedResume, jobDescription);

  return {
    atsScore: round(atsScore),
    matchScore: round((keywordScore * 0.55 + semanticScore * 0.45)),
    parseScore: round(parseScore),
    keywordScore: round(keywordScore),
    semanticScore: round(semanticScore),
    formatScore: round(formatScore),
    readabilityScore: round(readabilityScore),
    grade: grade(atsScore),
    missingKeywords,
    suggestions: buildSuggestions(parsedResume, missingKeywords, formatScore, readabilityScore),
    heatmapData: parsedResume.sections.map((section) => {
      const sectionScore = scoreSection(section.content, missingKeywords);
      return {
        section: section.title,
        score: sectionScore,
        status: sectionScore >= 80 ? "strong" : sectionScore >= 60 ? "warning" : "weak",
      };
    }),
  };
}

function computeParseScore(resume: ParsedResume) {
  let score = 100;
  if (!/@/.test(resume.rawText)) score -= 15;
  if (!resume.sections.some((section) => section.type === "experience")) score -= 25;
  if (!resume.sections.some((section) => section.type === "skills") && resume.skills.length < 4) score -= 20;
  if (!resume.sections.some((section) => section.type === "education")) score -= 10;
  if (resume.wordCount < 250) score -= 12;
  return clamp(score);
}

function computeFormatScore(resume: ParsedResume) {
  const base = { low: 100, medium: 82, high: 68, critical: 45 }[resume.layoutRisk];
  return clamp(base - resume.layoutIssues.length * 4);
}

function computeKeywordScore(resume: ParsedResume, jobDescription?: string) {
  if (!jobDescription) return 58;
  const required = extractSkills(jobDescription);
  if (required.length === 0) return 60;
  const resumeSkills = new Set(resume.skills.map((skill) => skill.toLowerCase()));
  const matched = required.filter(
    (skill) => resumeSkills.has(skill.toLowerCase()) || resume.rawText.toLowerCase().includes(skill.toLowerCase()),
  );
  return (matched.length / required.length) * 100;
}

function computeSemanticScore(resumeText: string, jobDescription?: string) {
  if (!jobDescription) return 55;
  const resumeTerms = uniqueTerms(resumeText);
  const jdTerms = Array.from(uniqueTerms(jobDescription));
  const overlap = jdTerms.filter((term) => resumeTerms.has(term)).length;
  return clamp(40 + (overlap / Math.max(jdTerms.length, 1)) * 60);
}

function computeReadabilityScore(resume: ParsedResume) {
  const bullets = resume.rawText
    .split("\n")
    .map((line) => line.trim().replace(/^[•\-*]\s*/, ""))
    .filter((line) => line.length > 35);

  if (bullets.length === 0) return 58;
  const strong = bullets.filter((bullet) => STRONG_VERBS.has((bullet.split(/\s+/)[0] ?? "").toLowerCase())).length;
  const quantified = bullets.filter((bullet) => /\d+[%$xXmMk]?/.test(bullet)).length;
  return clamp(65 + (strong / bullets.length) * 20 + (quantified / bullets.length) * 15);
}

function getMissingKeywords(resume: ParsedResume, jobDescription?: string) {
  if (!jobDescription) return [];
  const jdSkills = extractSkills(jobDescription);
  return jdSkills.filter((skill) => !resume.rawText.toLowerCase().includes(skill.toLowerCase()));
}

function buildSuggestions(
  resume: ParsedResume,
  missingKeywords: string[],
  formatScore: number,
  readabilityScore: number,
) {
  const suggestions: ReturnType<typeof scoreResume>["suggestions"] = [];

  if (formatScore < 80) {
    suggestions.push({
      category: "formatting",
      title: "Simplify resume layout",
      impact: round((100 - formatScore) * 0.2),
      detail: resume.layoutIssues.map((issue) => issue.message).join(" "),
    });
  }

  if (missingKeywords.length > 0) {
    suggestions.push({
      category: "keywords",
      title: "Add missing role keywords",
      impact: Math.min(18, missingKeywords.length * 3),
      detail: `Work these in truthfully: ${missingKeywords.slice(0, 8).join(", ")}.`,
    });
  }

  if (readabilityScore < 82) {
    suggestions.push({
      category: "readability",
      title: "Strengthen bullets with outcomes",
      impact: round((90 - readabilityScore) * 0.1),
      detail: "Start bullets with action verbs and add measurable scope, speed, revenue, cost, quality, or usage metrics.",
    });
  }

  return suggestions.sort((a, b) => b.impact - a.impact);
}

function scoreSection(content: string, missingKeywords: string[]) {
  const containsMissing = missingKeywords.some((keyword) => content.toLowerCase().includes(keyword.toLowerCase()));
  let score = content.length > 180 ? 82 : 64;
  if (/\d+[%$xXmMk]?/.test(content)) score += 8;
  if (containsMissing) score += 5;
  return clamp(score);
}

function uniqueTerms(text: string) {
  const stop = new Set(["the", "and", "for", "with", "that", "this", "from", "were", "are", "was", "you", "job"]);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#.\s]/g, " ")
      .split(/\s+/)
      .filter((term) => term.length > 3 && !stop.has(term)),
  );
}

function grade(score: number): AnalysisResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 65) return "C";
  if (score >= 50) return "D";
  return "F";
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
