import { BarChart3, FileCheck2, Gauge, SearchCheck } from "lucide-react";
import type { AnalysisResult } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import { HoverTooltip } from "@/components/ui/hover-tooltip";

export function ScoreDashboard({ result }: { result: AnalysisResult }) {
  const scores = [
    { 
      label: "ATS score", 
      value: result.atsScore, 
      icon: Gauge, 
      caption: `Grade ${result.grade}`,
      ideal: "Ideal: 80+\nThe overall composite score indicating your likelihood of passing an ATS filter." 
    },
    { 
      label: "JD match", 
      value: result.matchScore, 
      icon: SearchCheck, 
      caption: `${result.missingKeywords.length} missing`,
      ideal: "Ideal: 75+\nMeasures how well your skills and keywords align with the provided Job Description."
    },
    { 
      label: "Parse", 
      value: result.parseScore, 
      icon: FileCheck2, 
      caption: result.parsedResume.layoutRisk,
      ideal: "Ideal: 90+\nIndicates if your layout is easily readable by machines (e.g. no complex tables or columns)."
    },
    { 
      label: "Keywords", 
      value: result.keywordScore, 
      icon: BarChart3, 
      caption: "coverage",
      ideal: "Ideal: 100%\nThe percentage of critical hard skills found in your resume compared to the job description."
    },
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
            <HoverTooltip key={score.label} content={<div style={{ whiteSpace: "pre-line" }}>{score.ideal}</div>}>
              <div className="score-tile">
                <div className="score-label">
                  <score.icon size={16} />
                  {score.label}
                </div>
                <div className="score-value">{score.value}</div>
                <div className="score-caption">{score.caption}</div>
              </div>
            </HoverTooltip>
          ))}
        </div>
      </div>
    </section>
  );
}
