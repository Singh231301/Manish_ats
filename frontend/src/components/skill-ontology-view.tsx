import { OntologyMatch } from "@/types/analysis";

interface Props {
  ontology: OntologyMatch;
}

export function SkillOntologyView({ ontology }: Props) {
  return (
    <div className="panel stack">
      <div className="panel-header">
        <h3 className="panel-title">Skill Graph Match</h3>
        <div className="badge green">Match: {ontology.match_score}%</div>
      </div>
      <div className="panel-body stack">
        <div>
          <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Exact Matches</h4>
          <div className="skill-graph">
            {ontology.matched.map((skill) => (
              <span key={skill} className="badge green">{skill}</span>
            ))}
          </div>
        </div>
        
        {ontology.partial_matched.length > 0 && (
          <div>
            <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Semantic Matches</h4>
            <div className="skill-graph">
              {ontology.partial_matched.map((item) => (
                <span key={item.skill} className="badge yellow">
                  {item.skill} <span style={{ opacity: 0.6, marginLeft: 4 }}>via {item.matched_via}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {ontology.missing.length > 0 && (
          <div>
            <h4 style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Missing Core Skills</h4>
            <div className="skill-graph">
              {ontology.missing.map((skill) => (
                <span key={skill} className="badge red">{skill}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
