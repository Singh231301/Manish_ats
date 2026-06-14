import { useState } from "react";

interface Props {
  originalText: string;
  optimizedText: string;
}

export function DiffViewer({ originalText, optimizedText }: Props) {
  // A simplistic line-by-line diff for demonstration
  // In a real app, you'd use something like diff-match-patch
  const originalLines = originalText.split("\n");
  const optimizedLines = optimizedText.split("\n");

  return (
    <div className="panel stack">
      <div className="panel-header">
        <h3 className="panel-title">AI Content Optimization</h3>
        <div className="badge purple">Diff View</div>
      </div>
      <div className="panel-body diff-view">
        <div>
          <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Original Resume</h4>
          <div className="diff-pane" style={{ background: "#fafafa" }}>
            {originalLines.map((line, i) => {
              const matched = optimizedLines.includes(line);
              return (
                <div key={`orig-${i}`} className={matched ? "" : "diff-remove"}>
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Optimized Output</h4>
          <div className="diff-pane">
            {optimizedLines.map((line, i) => {
              const matched = originalLines.includes(line);
              return (
                <div key={`opt-${i}`} className={matched ? "" : "diff-add"}>
                  {line || "\u00A0"}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
