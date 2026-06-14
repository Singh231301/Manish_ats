import type { AnalysisResult } from "@/types/analysis";

export function ResumeHeatmap({ result }: { result: AnalysisResult }) {
  if (!result.heatmapData?.length) return null;

  return (
    <div className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Spatial Attention Heatmap</h2>
      </div>
      <div className="panel-body">
        <div className="heatmap">
          {result.heatmapData.map((zone, i) => (
            <div key={i} className="heatmap-cell">
              <div style={{ fontSize: 13, fontWeight: 800 }}>{zone.section}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Page {zone.page} • {zone.position}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Density: {(zone.keyword_density * 100).toFixed(0)}%</div>
              <div className="heatmap-bar">
                <div
                  className={`heatmap-fill ${zone.status}`}
                  style={{ width: `${Math.min(zone.visibility_score, 100)}%` }}
                />
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, marginTop: 6, textAlign: "right", color: `var(--${zone.status === "strong" ? "green" : zone.status === "warning" ? "yellow" : "red"})` }}>
                {zone.visibility_score}% visibility
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
