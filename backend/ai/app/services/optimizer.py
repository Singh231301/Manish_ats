from app.services.parser import extract_skills
from app.config import config
import logging
import json

logger = logging.getLogger(__name__)

try:
    from langchain_groq import ChatGroq
    from langchain_core.prompts import PromptTemplate
    from langchain_core.output_parsers import JsonOutputParser
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False

# Prompt structured to output JSON matching our expected schema
OPTIMIZE_PROMPT = """
You are an expert technical staff engineer and resume optimizer.
Task: Integrate target keywords into the candidate's experience bullets.
Constraints:
1. Maintain strict alignment with the STAR framework (Situation, Task, Action, Result).
2. Do not falsify data, scale up job metrics, or add unverified tool certifications.
3. Keep text formatting clean, professional, and free of marketing buzzwords.
4. Tone should be {tone}.

Original Resume Text:
{resume_text}

Target Job Description Skills (Missing):
{missing_skills}

Return ONLY valid JSON with this structure:
{{
  "optimizedText": "The full rewritten resume text",
  "changes": [
    {{
      "section": "experience",
      "reason": "Why you made this change",
      "recommendation": "The specific rewrite suggestion"
    }}
  ],
  "keywordsAdded": ["Skill1", "Skill2"]
}}
"""

def optimize_resume(resume_text: str, job_description: str | None = None, tone: str = "direct") -> dict:
    jd_skills = extract_skills(job_description or "")
    missing = [skill for skill in jd_skills if skill.lower() not in resume_text.lower()][:8]

    if LLM_AVAILABLE and config.GROQ_API_KEY and missing:
        try:
            logger.info(f"Using Groq model {config.GROQ_MODEL} for optimization")
            llm = ChatGroq(temperature=0.2, groq_api_key=config.GROQ_API_KEY, model_name=config.GROQ_MODEL)
            prompt = PromptTemplate(
                template=OPTIMIZE_PROMPT,
                input_variables=["tone", "resume_text", "missing_skills"]
            )
            chain = prompt | llm | JsonOutputParser()
            result = chain.invoke({
                "tone": tone,
                "resume_text": resume_text,
                "missing_skills": ", ".join(missing)
            })
            result["modelUsed"] = f"groq-{config.GROQ_MODEL}"
            return result
        except Exception as e:
            logger.error(f"LLM Optimization failed: {e}. Falling back to deterministic.")

    # Deterministic fallback
    changes = [
        {
            "section": "keywords",
            "reason": "The target job description mentions this skill, but the resume does not.",
            "recommendation": f"Add truthful evidence for {skill} in the most relevant experience bullet.",
        }
        for skill in missing
    ]

    return {
        "optimizedText": resume_text,
        "changes": changes,
        "keywordsAdded": missing,
        "modelUsed": f"deterministic-{tone}",
    }
