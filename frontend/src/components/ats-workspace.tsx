"use client";

import { useState } from "react";
import type { AnalysisResult } from "@/types/analysis";
import { api } from "@/lib/api";
import { AnalyzerForm } from "./analyzer-form";
import { ScoreDashboard } from "./score-dashboard";
import { SuggestionsTable } from "./suggestions-table";
import { ResumeHeatmap } from "./resume-heatmap";
import { FileDropzone } from "./file-dropzone";
import { ATSSimulatorView } from "./ats-simulator";
import { SkillOntologyView } from "./skill-ontology-view";
import { ProgressStream } from "./progress-stream";
import { Button } from "./ui/button";
import { toast, Toaster } from "sonner";
import { ErrorBoundary } from "./error-boundary";

export function AtsWorkspace() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "ontology" | "simulator" | "heatmap">("dashboard");
  const [taskId, setTaskId] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>();
  const [parsedText, setParsedText] = useState<string>("");

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setTaskId("file-upload-" + Date.now()); 
    try {
      const uploadRes = await api.uploadFile(file);
      setParsedText(uploadRes.parsedResume.rawText);
      setUploadedFileName(file.name);
      toast.success(`Uploaded successfully: ${file.name}`);
    } catch (e: any) {
      toast.error(e.message || "Upload failed. Please check your backend connection.");
    } finally {
      setLoading(false);
      setTaskId(null);
    }
  };

  const handleAnalyze = async (data: { resumeText: string; jobDescription: string }) => {
    setLoading(true);
    setTaskId("text-analysis-" + Date.now());
    try {
      const res = await api.analyze({ ...data, targetRole: "workday" });
      setResult(res);
      toast.success("Analysis complete!");
    } catch (e: any) {
      toast.error(e.message || "Analysis failed. Please check your backend connection and ensure pgvector is running.");
      setResult(null);
    } finally {
      setLoading(false);
      setTaskId(null);
    }
  };

  return (
    <ErrorBoundary>
      <Toaster position="top-right" richColors />
      <div className="workspace-grid">
        <div className="stack">
          <div className="panel">
            <div className="panel-header">
              <h2 className="panel-title">Upload & Scan</h2>
            </div>
            <div className="panel-body">
              <FileDropzone onFileSelect={handleFileSelect} isUploading={loading} fileName={uploadedFileName} />
              
              <div style={{ margin: "24px 0", textAlign: "center", color: "var(--muted)", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>OR PASTE TEXT</div>
              
              <AnalyzerForm onAnalyze={handleAnalyze} isLoading={loading} prefilledResumeText={parsedText} />
            </div>
          </div>

          {taskId && <ProgressStream taskId={taskId} />}
        </div>

        <div className="main">
          {result ? (
            <div className="stack">
              <div className="toolbar">
                <div className="title-block">
                  <h1>Analysis Results</h1>
                  <p>Scored against your target parameters.</p>
                </div>
                <div className="tabs">
                  <button
                    className={activeTab === "dashboard" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("dashboard")}
                  >
                    Dashboard
                  </button>
                  <button
                    className={activeTab === "ontology" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("ontology")}
                  >
                    Skill Map
                  </button>
                  <button
                    className={activeTab === "simulator" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("simulator")}
                  >
                    ATS Simulator
                  </button>
                  <button
                    className={activeTab === "heatmap" ? "tab active" : "tab"}
                    onClick={() => setActiveTab("heatmap")}
                  >
                    Heatmap
                  </button>
                </div>
              </div>

              {activeTab === "dashboard" && (
                <div className="stack">
                  <ScoreDashboard result={result} />
                  <SuggestionsTable suggestions={result.suggestions} />
                </div>
              )}
              
              {activeTab === "ontology" && (
                <div className="stack">
                  {result.ontologyData ? (
                    <SkillOntologyView ontology={result.ontologyData} />
                  ) : (
                    <div className="empty">No ontology data generated. Please provide a Job Description.</div>
                  )}
                </div>
              )}

              {activeTab === "simulator" && (
                <div className="stack">
                  {result.atsSimulation ? (
                    <ATSSimulatorView simulation={result.atsSimulation} />
                  ) : (
                    <div className="empty">No ATS simulation data available.</div>
                  )}
                </div>
              )}

              {activeTab === "heatmap" && (
                <div className="stack">
                  <ResumeHeatmap result={result} />
                </div>
              )}
            </div>
          ) : (
            <div className="empty">
              <div className="stack" style={{ alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: 20 }}>Awaiting Document</h2>
                <p style={{ margin: 0 }}>Upload a resume or paste text to generate an analysis.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
