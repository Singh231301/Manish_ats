import logging
from sentence_transformers import SentenceTransformer
from app.config import config

logger = logging.getLogger(__name__)

# Global model instance
_model: SentenceTransformer | None = None

def load_embedding_model():
    global _model
    if _model is None:
        logger.info(f"Loading embedding model: {config.EMBEDDING_MODEL}")
        _model = SentenceTransformer(config.EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully.")

def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        load_embedding_model()
    return _model

def generate_embedding(text: str) -> list[float]:
    model = get_model()
    clean_text = text.strip().replace("\n", " ")
    embedding = model.encode(clean_text, normalize_embeddings=True)
    return embedding.tolist()

def batch_embed(texts: list[str]) -> list[list[float]]:
    model = get_model()
    clean_texts = [text.strip().replace("\n", " ") for text in texts]
    embeddings = model.encode(clean_texts, normalize_embeddings=True)
    return [emb.tolist() for emb in embeddings]
