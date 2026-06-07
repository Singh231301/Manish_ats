from app.models.schemas import OptimizeRequest, ParseRequest, ScoreRequest
from app.services.optimizer import optimize_resume
from app.services.parser import parse_resume
from app.services.scorer import score_resume
from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok", "service": "ats-ai"}


@router.post("/parse")
def parse(request: ParseRequest):
    return {"parsedResume": parse_resume(request.text)}


@router.post("/score")
def score(request: ScoreRequest):
    parsed = parse_resume(request.resumeText)
    return score_resume(parsed, request.jobDescription)


@router.post("/optimize")
def optimize(request: OptimizeRequest):
    return optimize_resume(request.resumeText, request.jobDescription, request.tone)
