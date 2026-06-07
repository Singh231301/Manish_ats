from pydantic import BaseModel, Field


class ParseRequest(BaseModel):
    text: str = Field(min_length=80)


class ScoreRequest(BaseModel):
    resumeText: str = Field(min_length=80)
    jobDescription: str | None = Field(default=None, min_length=50)


class OptimizeRequest(BaseModel):
    analysisId: str | None = None
    resumeText: str = Field(min_length=80)
    jobDescription: str | None = Field(default=None, min_length=50)
    tone: str = "direct"
