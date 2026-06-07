from app.services.parser import extract_skills


def score_resume(parsed_resume: dict, job_description: str | None = None) -> dict:
    parse_score = 100
    if "@" not in parsed_resume["rawText"]:
        parse_score -= 15
    if not any(section["type"] == "experience" for section in parsed_resume["sections"]):
        parse_score -= 25
    if len(parsed_resume["skills"]) < 4:
        parse_score -= 15

    format_score = {"low": 100, "medium": 82, "high": 68, "critical": 45}.get(
        parsed_resume["layoutRisk"], 70
    )

    keyword_score = 58
    missing = []
    if job_description:
        jd_skills = extract_skills(job_description)
        missing = [
            skill
            for skill in jd_skills
            if skill.lower() not in parsed_resume["rawText"].lower()
        ]
        keyword_score = 100 if not jd_skills else ((len(jd_skills) - len(missing)) / len(jd_skills)) * 100

    semantic_score = 55 if not job_description else 70
    readability_score = 75
    ats_score = (
        parse_score * 0.25
        + format_score * 0.20
        + keyword_score * 0.25
        + semantic_score * 0.20
        + readability_score * 0.10
    )

    return {
        "atsScore": round(ats_score, 1),
        "matchScore": round(keyword_score * 0.55 + semantic_score * 0.45, 1),
        "parseScore": round(parse_score, 1),
        "keywordScore": round(keyword_score, 1),
        "semanticScore": round(semantic_score, 1),
        "formatScore": round(format_score, 1),
        "readabilityScore": round(readability_score, 1),
        "missingKeywords": missing,
    }
