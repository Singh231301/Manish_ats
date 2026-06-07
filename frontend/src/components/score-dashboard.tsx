import { BarChart3, FileCheck2, Gauge, SearchCheck } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";

export function ScoreDashboard({ result }: { result: AnalysisResult }) {
  const scores = [
    { label: "ATS score", value: result.atsScore, icon: Gauge, caption: `Grade ${result.grade}` },
    { label: "JD match", value: result.matchScore, icon: SearchCheck, caption: `${result.missingKeywords.length} missing` },
    { label: "Parse", value: result.parseScore, icon: FileCheck2, caption: result.parsedResume.layoutRisk },
    { label: "Keywords", value: result.keywordScore, icon: BarChart3, caption: "coverage" },
  ];

  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Score dashboard</h2>
        <Badge tone={result.atsScore >= 80 ? "green" : result.atsScore >= 65 ? "yellow" : "red"}>{result.grade}</Badge>
      </div>
      <div className="panel-body">
        <div className="grid-4">
          {scores.map((score) => (
            <div className="score-tile" key={score.label}>
              <div className="score-label">
                <score.icon size={16} />
                {score.label}
              </div>
              <div className="score-value">{score.value}</div>
              <div className="score-caption">{score.caption}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
