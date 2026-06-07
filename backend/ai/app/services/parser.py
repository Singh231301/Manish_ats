import re

SECTION_ALIASES = {
    "summary": "summary",
    "profile": "summary",
    "objective": "summary",
    "experience": "experience",
    "work experience": "experience",
    "professional experience": "experience",
    "education": "education",
    "skills": "skills",
    "technical skills": "skills",
    "projects": "projects",
}

SKILL_ALIASES = {
    "aws": "AWS",
    "amazon web services": "AWS",
    "gcp": "Google Cloud Platform",
    "azure": "Azure",
    "javascript": "JavaScript",
    "js": "JavaScript",
    "typescript": "TypeScript",
    "ts": "TypeScript",
    "react": "React",
    "next.js": "Next.js",
    "node.js": "Node.js",
    "python": "Python",
    "sql": "SQL",
    "postgresql": "PostgreSQL",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    "fastapi": "FastAPI",
    "redis": "Redis",
    "machine learning": "Machine Learning",
    "ml": "Machine Learning",
    "nlp": "Natural Language Processing",
    "ci/cd": "CI/CD",
}


def parse_resume(text: str) -> dict:
    normalized = text.replace("\r\n", "\n").strip()
    sections = []
    current_title = "Profile"
    current_type = "summary"
    buffer: list[str] = []

    def flush():
        nonlocal buffer
        content = "\n".join(buffer).strip()
        if content:
            sections.append(
                {
                    "type": current_type,
                    "title": current_title,
                    "content": content,
                    "confidence": 0.88 if current_type != "unknown" else 0.55,
                }
            )
        buffer = []

    for line in normalized.split("\n"):
        clean = line.strip()
        key = re.sub(r"[:\-]+$", "", clean.lower())
        is_header = len(clean) <= 48 and (
            key in SECTION_ALIASES
            or re.match(r"^[A-Z][A-Z\s/&]{2,40}$", clean)
            or re.match(r"^[A-Z][a-zA-Z\s/&]{2,40}:$", clean)
        )
        if is_header:
            flush()
            current_title = clean.rstrip(":")
            current_type = SECTION_ALIASES.get(key, "unknown")
        else:
            buffer.append(line)
    flush()

    layout_issues = detect_layout_issues(normalized)
    return {
        "rawText": normalized,
        "sections": sections,
        "skills": extract_skills(normalized),
        "wordCount": len([word for word in re.split(r"\s+", normalized) if word]),
        "layoutRisk": layout_risk(layout_issues),
        "layoutIssues": layout_issues,
    }


def extract_skills(text: str) -> list[str]:
    found = set()
    lower = text.lower()
    for alias, canonical in SKILL_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", lower):
            found.add(canonical)
    return sorted(found)


def detect_layout_issues(text: str) -> list[dict]:
    issues = []
    if re.search(r"\|\s*\w+", text) or "\t\t" in text:
        issues.append(
            {
                "type": "tables",
                "severity": "high",
                "message": "Table-like text detected. Convert tables into plain one-column bullet lists.",
            }
        )
    if not re.search(r"@", text):
        issues.append(
            {
                "type": "contact",
                "severity": "medium",
                "message": "No email address detected in resume text.",
            }
        )
    return issues


def layout_risk(issues: list[dict]) -> str:
    severities = {issue["severity"] for issue in issues}
    if "critical" in severities:
        return "critical"
    if "high" in severities:
        return "high"
    if issues:
        return "medium"
    return "low"
