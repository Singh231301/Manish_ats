import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    VECTOR_DIMENSION = 768
    EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"
    
config = Config()
