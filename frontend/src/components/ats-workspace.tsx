"use client";

import { AlertCircle, Database, Sparkles } from "lucide-react";
import { useState } from "react";
import { AnalyzerForm } from "@/components/analyzer-form";
import { ResumeEditor } from "@/components/resume-editor";
import { ResumeHeatmap } from "@/components/resume-heatmap";
import { ScoreDashboard } from "@/components/score-dashboard";
import { Sidebar } from "@/components/shell/sidebar";
import { Topbar } from "@/components/shell/topbar";
import { SuggestionsTable } from "@/components/suggestions-table";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { createAnalysis } from "@/lib/api";
import { sampleJobDescription, sampleResume } from "@/lib/sample-data";
import type { AnalysisResult } from "@/types/analysis";

type View = "overview" | "heatmap" | "editor";

export function ATSWorkspace() {
  const [resumeText, setResumeText] = useState(sampleResume);
  const [jobDescription, setJobDescription] = useState(sampleJobDescription);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("overview");

  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const analysis = await createAnalysis({ resumeText, jobDescription });
      setResult(analysis);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Topbar />
        <div className="page">
          <div className="toolbar">
            <div className="title-block">
              <h1>Resume optimization workspace</h1>
              <p>Parse, score, heatmap, and rewrite ATS-ready resumes before deployment.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <Badge tone="green">
                <Database size={13} />
                PostgreSQL ready
              </Badge>
              <Badge tone="purple">
                <Sparkles size={13} />
                AI service layer
              </Badge>
            </div>
          </div>

          {error ? (
            <div className="panel" style={{ marginBottom: 18, borderColor: "rgba(229, 72, 77, .35)" }}>
              <div className="panel-body" style={{ display: "flex", gap: 10, color: "var(--red)" }}>
                <AlertCircle size={18} />
                {error}
              </div>
            </div>
          ) : null}

          <div className="workspace-grid">
            <AnalyzerForm
              resumeText={resumeText}
              jobDescription={jobDescription}
              loading={loading}
              onResumeChange={setResumeText}
              onJobChange={setJobDescription}
              onAnalyze={analyze}
            />

            <div className="stack">
              <Tabs
                value={view}
                onChange={setView}
                options={[
                  { value: "overview", label: "Overview" },
                  { value: "heatmap", label: "Heatmap" },
                  { value: "editor", label: "Editor" },
                ]}
              />

              {result ? (
                <>
                  {view === "overview" ? (
                    <>
                      <ScoreDashboard result={result} />
                      <SuggestionsTable result={result} />
                    </>
                  ) : null}
                  {view === "heatmap" ? <ResumeHeatmap result={result} /> : null}
                  {view === "editor" ? <ResumeEditor value={resumeText} onChange={setResumeText} /> : null}
                </>
              ) : (
                <div className="empty">
                  <div>
                    <Sparkles size={30} />
                    <p>Run the first analysis to populate scores, heatmaps, and rewrite actions.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
