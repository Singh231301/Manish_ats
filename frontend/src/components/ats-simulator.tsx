import { ATSSimulationResult } from "@/types/analysis";

interface Props {
  simulation: ATSSimulationResult;
}

export function ATSSimulatorView({ simulation }: Props) {
  return (
    <div className="panel stack">
      <div className="panel-header">
        <h3 className="panel-title">ATS Recruiter View ({simulation.atsName})</h3>
        <div className="badge purple">Score: {simulation.compatibilityScore}%</div>
      </div>
      <div className="panel-body stack">
        {simulation.issuesFlagged.length > 0 && (
          <div style={{ background: "rgba(217, 154, 22, .13)", padding: 12, borderRadius: 8 }}>
            <h4 style={{ margin: "0 0 8px 0", fontSize: 12, color: "var(--yellow)" }}>Parser Warnings</h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13 }}>
              {simulation.issuesFlagged.map((issue, idx) => (
                <li key={idx} style={{ marginBottom: 4 }}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        <div>
          <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>What the ATS Extracted</h4>
          <div style={{ 
            background: "#1e1e1e", color: "#d4d4d4", padding: 16, 
            borderRadius: 8, fontFamily: "monospace", fontSize: 12,
            whiteSpace: "pre-wrap", maxHeight: 400, overflow: "auto"
          }}>
            {simulation.simulatedText || "No text could be extracted."}
          </div>
        </div>
      </div>
    </div>
  );
}
