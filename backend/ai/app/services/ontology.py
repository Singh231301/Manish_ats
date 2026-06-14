# Simple adjacency graph representing a subset of ESCO/O*NET skill taxonomy
TAXONOMY_GRAPH = {
    "javascript": ["js", "ecmascript", "frontend", "web development", "react", "node.js"],
    "react": ["react.js", "reactjs", "frontend", "javascript", "ui", "user interface"],
    "node.js": ["node", "nodejs", "backend", "javascript", "express", "api"],
    "python": ["backend", "data science", "machine learning", "django", "fastapi", "flask", "scripting"],
    "sql": ["database", "postgresql", "mysql", "rdbms", "data modeling", "query optimization"],
    "aws": ["amazon web services", "cloud", "infrastructure", "ec2", "s3", "lambda", "devops"],
    "docker": ["containerization", "containers", "devops", "kubernetes", "deployment"],
    "kubernetes": ["k8s", "container orchestration", "devops", "docker", "cloud native"],
    "machine learning": ["ml", "ai", "artificial intelligence", "data science", "predictive modeling", "neural networks", "deep learning"],
    "ci/cd": ["continuous integration", "continuous deployment", "jenkins", "github actions", "gitlab ci", "automation", "devops"]
}

def expand_query(skill_terms: list[str]) -> list[str]:
    """Expands a list of skills using the taxonomy graph."""
    expanded = set(skill_terms)
    for term in skill_terms:
        term_lower = term.lower()
        if term_lower in TAXONOMY_GRAPH:
            expanded.update(TAXONOMY_GRAPH[term_lower])
        # Reverse lookup for aliases
        for key, aliases in TAXONOMY_GRAPH.items():
            if term_lower in aliases:
                expanded.add(key)
    return sorted(list(expanded))

def compute_ontology_match(resume_skills: list[str], jd_skills: list[str]) -> dict:
    resume_lower = {s.lower() for s in resume_skills}
    jd_lower = {s.lower() for s in jd_skills}
    
    matched = []
    partial_matched = []
    missing = []
    
    resume_expanded = set(resume_lower)
    for skill in resume_lower:
        resume_expanded.update(expand_query([skill]))
        
    for skill in jd_lower:
        if skill in resume_lower:
            matched.append(skill)
        elif skill in resume_expanded:
            # Find what it matched through
            source = [s for s in resume_lower if skill in expand_query([s]) or s in expand_query([skill])]
            partial_matched.append({"skill": skill, "matched_via": source[0] if source else "related concept"})
        else:
            missing.append(skill)
            
    total = max(len(jd_lower), 1)
    score = ((len(matched) + len(partial_matched) * 0.5) / total) * 100
    
    return {
        "matched": matched,
        "partial_matched": partial_matched,
        "missing": missing,
        "match_score": round(min(100.0, score), 2)
    }
