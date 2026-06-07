from app.services.parser import extract_skills


def optimize_resume(resume_text: str, job_description: str | None = None, tone: str = "direct") -> dict:
    jd_skills = extract_skills(job_description or "")
    missing = [
        skill for skill in jd_skills if skill.lower() not in resume_text.lower()
    ]

    changes = [
        {
            "section": "keywords",
            "reason": "The target job description mentions this skill, but the resume does not.",
            "recommendation": f"Add truthful evidence for {skill} in the most relevant experience bullet.",
        }
        for skill in missing[:8]
    ]

    return {
        "optimizedText": resume_text,
        "changes": changes,
        "keywordsAdded": missing[:8],
        "modelUsed": f"deterministic-{tone}",
    }
