"use client";

import { useState, useEffect } from "react";
import { Play, WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AnalyzerForm({
  onAnalyze,
  isLoading,
  prefilledResumeText,
}: {
  onAnalyze: (data: { resumeText: string; jobDescription: string }) => void;
  isLoading: boolean;
  prefilledResumeText?: string;
}) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  useEffect(() => {
    if (prefilledResumeText) {
      setResumeText(prefilledResumeText);
    }
  }, [prefilledResumeText]);

  return (
    <div className="stack">
      <label className="stack">
        <span className="field-label">Resume text</span>
        <textarea 
          className="textarea" 
          value={resumeText} 
          onChange={(event) => setResumeText(event.target.value)} 
          placeholder="Paste your resume text here..."
        />
      </label>
      <label className="stack">
        <span className="field-label">Target job description (Optional)</span>
        <textarea
          className="textarea"
          style={{ minHeight: 170 }}
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          placeholder="Paste the job description here..."
        />
      </label>
      <Button 
        variant="primary" 
        icon={isLoading ? <WandSparkles size={16} /> : <Play size={16} />} 
        onClick={() => onAnalyze({ resumeText, jobDescription })} 
        disabled={isLoading || !resumeText.trim()}
      >
        {isLoading ? "Analyzing..." : "Run ATS Analysis"}
      </Button>
    </div>
  );
}
