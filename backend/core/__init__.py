import os
from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
from language_models import MODEL_MAP

# --- Environment variables ---
ES_HOST = os.getenv("ES_HOST", "http://elasticsearch:9200")
ES_USER = os.getenv("ES_USER", "")
ES_PASSWORD = os.getenv("ES_PASSWORD", "")
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")

# --- Initialize clients ---
es_client = Elasticsearch(
    ES_HOST,
    basic_auth=(ES_USER, ES_PASSWORD) if ES_USER else None,
    verify_certs=False,
    request_timeout=30,
    retry_on_timeout=True,
    headers={"Accept": "application/json"}
)


qdrant_client = QdrantClient(url=QDRANT_URL)

# --- Sentence model ---
sentence_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# --- Language models map ---
initialized_models = {}
for name, model_class in MODEL_MAP.items():
    model = model_class()
    initialized_models[name] = model
