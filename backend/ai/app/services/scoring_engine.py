from rank_bm25 import BM25Okapi
from app.services.embedding import generate_embedding
import numpy as np

def compute_hybrid_score(resume_text: str, job_description: str, alpha=0.4) -> float:
    """
    Computes a hybrid similarity score using BM25 (sparse) and Cosine Similarity (dense).
    alpha: weight of sparse tokens (BM25) vs dense contextual space.
    """
    if not job_description or not resume_text:
        return 0.0
        
    # Tier 1: BM25 (Sparse)
    # Very basic tokenization for BM25
    def tokenize(text):
        return text.lower().replace("\n", " ").split()
        
    jd_tokens = tokenize(job_description)
    resume_tokens = tokenize(resume_text)
    
    # We pretend the JD is the "corpus" we are searching against, or vice versa.
    # Actually, let's treat the resume as the document and JD as query
    bm25 = BM25Okapi([resume_tokens])
    bm25_score_raw = bm25.get_scores(jd_tokens)[0]
    
    # Normalize BM25 score (rough approximation, as BM25 is unbounded)
    # A typical decent match might score around len(jd_tokens) * 0.1
    max_expected_bm25 = len(jd_tokens) * 0.15
    sparse_score = min(1.0, bm25_score_raw / max(max_expected_bm25, 1))
    
    # Tier 2: Dense Bi-Encoder
    resume_emb = np.array(generate_embedding(resume_text))
    jd_emb = np.array(generate_embedding(job_description))
    
    # Cosine similarity
    dense_score = np.dot(resume_emb, jd_emb) / (np.linalg.norm(resume_emb) * np.linalg.norm(jd_emb))
    dense_score = max(0.0, float(dense_score)) # Ensure no negative scores
    
    # Combined Linear Vector Alignment Formula
    combined_score = (alpha * sparse_score) + ((1.0 - alpha) * dense_score)
    return round(combined_score * 100, 2)
