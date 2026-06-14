from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.services.embedding import load_embedding_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    load_embedding_model()
    yield

app = FastAPI(title="ATS AI Service", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:4000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
