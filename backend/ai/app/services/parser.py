import re
import io

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from docx import Document
except ImportError:
    Document = None

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

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extracts raw text from PDF or DOCX binary data."""
    ext = filename.lower().split('.')[-1]
    
    if ext == 'pdf':
        text = ""
        # 1. Try PyMuPDF first as it handles slightly corrupted PDFs better
        try:
            import fitz
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                page_text = page.get_text()
                if page_text:
                    text += page_text + "\n"
        except Exception:
            pass
            
        if text.strip():
            return text
            
        # 2. Try pdfplumber as a fallback
        text = ""
        if pdfplumber is not None:
            try:
                with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                    for page in pdf.pages:
                        extracted = page.extract_text(x_tolerance=2, y_tolerance=3)
                        if extracted:
                            text += extracted + "\n"
            except Exception:
                pass
                
        if text.strip():
            return text
            
        # 3. Both failed to extract text (it's an image). Return original warning message.
        return "OCR parsing not fully implemented without poppler/tesseract system binaries."
            
    elif ext in ['doc', 'docx']:
        if Document is None:
            return "Error: python-docx not installed"
        try:
            doc = Document(io.BytesIO(file_bytes))
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception as e:
            return f"Error parsing DOCX: {str(e)}"
            
    return file_bytes.decode('utf-8', errors='ignore')

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
    return sorted(list(found))

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
    # Check for text box hints
    if re.search(r"text box|two column|2-column", text, re.IGNORECASE):
        issues.append({
            "type": "layout",
            "severity": "critical",
            "message": "Potential multi-column or text-box layout. ATS systems often scramble this content."
        })
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
