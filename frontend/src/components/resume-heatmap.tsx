import type { AnalysisResult } from "@/types/analysis";

export function ResumeHeatmap({ result }: { result: AnalysisResult }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2 className="panel-title">Resume heatmap</h2>
        <span className="score-caption">Section-level parse and keyword signal</span>
      </div>
      <div className="panel-body">
        <div className="heatmap">
          {result.heatmapData.map((item) => (
            <div className="heatmap-cell" key={item.section}>
              <strong>{item.section}</strong>
              <div className="score-caption">{item.score}/100</div>
              <div className="heatmap-bar">
                <div className={`heatmap-fill ${item.status}`} style={{ width: `${item.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
