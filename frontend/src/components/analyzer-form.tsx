"use client";

import { ClipboardPaste, Play, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sampleJobDescription, sampleResume } from "@/lib/sample-data";

export function AnalyzerForm({
  resumeText,
  jobDescription,
  loading,
  onResumeChange,
  onJobChange,
  onAnalyze,
}: {
  resumeText: string;
  jobDescription: string;
  loading: boolean;
  onResumeChange: (value: string) => void;
  onJobChange: (value: string) => void;
  onAnalyze: () => void;
}) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Resume input</h2>
        <Button
          variant="secondary"
          icon={<ClipboardPaste size={16} />}
          onClick={() => {
            onResumeChange(sampleResume);
            onJobChange(sampleJobDescription);
          }}
        >
          Sample
        </Button>
      </div>
      <div className="panel-body stack">
        <label className="stack">
          <span className="field-label">Resume text</span>
          <textarea className="textarea" value={resumeText} onChange={(event) => onResumeChange(event.target.value)} />
        </label>
        <label className="stack">
          <span className="field-label">Target job description</span>
          <textarea
            className="textarea"
            style={{ minHeight: 170 }}
            value={jobDescription}
            onChange={(event) => onJobChange(event.target.value)}
          />
        </label>
        <Button variant="primary" icon={loading ? <WandSparkles size={16} /> : <Play size={16} />} onClick={onAnalyze} disabled={loading}>
          {loading ? "Analyzing" : "Run ATS analysis"}
        </Button>
      </div>
    </section>
  );
}
