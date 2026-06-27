from pydantic import BaseModel, Field

class ParseRequest(BaseModel):
    text: str = Field(min_length=10)

class ScoreRequest(BaseModel):
    resumeText: str = Field(min_length=10)
    jobDescription: str | None = Field(default=None)

class OptimizeRequest(BaseModel):
    analysisId: str | None = None
    resumeText: str = Field(min_length=10)
    jobDescription: str | None = Field(default=None)
    tone: str = "direct"

class EmbedRequest(BaseModel):
    text: str | list[str]

class EmbedResponse(BaseModel):
    embeddings: list[list[float]]

class ATSSimulateRequest(BaseModel):
    resumeText: str
    atsTarget: str

class HeatmapRequest(BaseModel):
    resumeText: str
    jobDescription: str | None = None

class HeatmapZone(BaseModel):
    section: str
    page: int
    position: str
    attention_weight: float
    keyword_density: float
    visibility_score: float
    status: str

class OntologyMatchRequest(BaseModel):
    resumeSkills: list[str]
    jdSkills: list[str]

class OntologyMatchResponse(BaseModel):
    matched: list[str]
    partial_matched: list[dict]
    missing: list[str]
    match_score: float

class AnalyzeFullRequest(BaseModel):
    resumeText: str = Field(min_length=10)
    jobDescription: str | None = None
    resumeSkills: list[str] = Field(default_factory=list)
    jdSkills: list[str] = Field(default_factory=list)
    atsTarget: str | None = None
