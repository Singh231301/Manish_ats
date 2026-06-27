import os
from celery import Celery
from app.services.parser import parse_resume, extract_text_from_file

redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "ats_tasks",
    broker=redis_url,
    backend=redis_url
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="parse_file_task")
def parse_file_task(file_bytes_hex: str, filename: str):
    file_bytes = bytes.fromhex(file_bytes_hex)
    raw_text = extract_text_from_file(file_bytes, filename)
    parsed = parse_resume(raw_text)
    return {"parsedResume": parsed.model_dump() if hasattr(parsed, "model_dump") else parsed}

from app.services.scorer import score_resume
from app.services.heatmap import compute_heatmap
from app.services.ontology import compute_ontology_match
from app.services.ats_simulator import simulate_ats

@celery_app.task(name="analyze_full_task")
def analyze_full_task(resume_text: str, jd_text: str | None, resume_skills: list[str], jd_skills: list[str], ats_target: str | None):
    parsed = parse_resume(resume_text)
    
    score_result = score_resume(parsed, jd_text)
    heatmap_result = {"zones": compute_heatmap(parsed, jd_text)}
    
    ontology_result = None
    if jd_text and jd_skills:
        ontology_result = compute_ontology_match(resume_skills, jd_skills)
        
    ats_result = None
    if ats_target:
        ats_result = simulate_ats(resume_text, ats_target, parsed.get("layoutIssues", []))
        
    return {
        "score": score_result,
        "heatmap": heatmap_result,
        "ontology": ontology_result,
        "atsSimulation": ats_result
    }
