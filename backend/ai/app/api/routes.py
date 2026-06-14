from app.models.schemas import (
    OptimizeRequest, ParseRequest, ScoreRequest, 
    EmbedRequest, EmbedResponse, ATSSimulateRequest, 
    HeatmapRequest, OntologyMatchRequest
)
from app.services.optimizer import optimize_resume
from app.services.parser import parse_resume, extract_text_from_file
from app.services.scorer import score_resume
from app.services.embedding import generate_embedding, batch_embed
from app.services.ontology import compute_ontology_match, expand_query
from app.services.heatmap import compute_heatmap
from app.services.ats_simulator import simulate_ats

from fastapi import APIRouter, UploadFile, File

router = APIRouter()

@router.get("/health")
def health():
    return {"status": "ok", "service": "ats-ai"}

@router.post("/parse")
def parse(request: ParseRequest):
    return {"parsedResume": parse_resume(request.text)}

@router.post("/parse-file")
async def parse_file(file: UploadFile = File(...)):
    file_bytes = await file.read()
    raw_text = extract_text_from_file(file_bytes, file.filename or "")
    return {"parsedResume": parse_resume(raw_text)}

@router.post("/score")
def score(request: ScoreRequest):
    parsed = parse_resume(request.resumeText)
    return score_resume(parsed, request.jobDescription)

@router.post("/optimize")
def optimize(request: OptimizeRequest):
    return optimize_resume(request.resumeText, request.jobDescription, request.tone)

@router.post("/embed", response_model=EmbedResponse)
def embed(request: EmbedRequest):
    if isinstance(request.text, str):
        return {"embeddings": [generate_embedding(request.text)]}
    return {"embeddings": batch_embed(request.text)}

@router.post("/ats-simulate")
def ats_simulate(request: ATSSimulateRequest):
    return simulate_ats(request.resumeText, request.atsTarget)

@router.post("/heatmap")
def heatmap(request: HeatmapRequest):
    parsed = parse_resume(request.resumeText)
    zones = compute_heatmap(parsed, request.jobDescription)
    return {"zones": zones}

@router.post("/ontology/match")
def ontology_match(request: OntologyMatchRequest):
    return compute_ontology_match(request.resumeSkills, request.jdSkills)

@router.post("/ontology/expand")
def ontology_expand(skills: list[str]):
    return {"expanded": expand_query(skills)}

from fastapi.responses import StreamingResponse
from app.services.queue import get_task_status, stream_task_progress

@router.get("/queue/{task_id}")
def queue_status(task_id: str):
    status = get_task_status(task_id)
    if not status:
        return {"status": "not_found"}
    return status

@router.get("/stream/{task_id}")
async def stream_progress(task_id: str):
    return StreamingResponse(stream_task_progress(task_id), media_type="text/event-stream")
