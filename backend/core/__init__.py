# init.py
import os
from sentence_transformers import SentenceTransformer
from elasticsearch import Elasticsearch
from qdrant_client import QdrantClient
from language_models import MODEL_MAP

# Initialize models and clients
es_client = Elasticsearch(hosts=[os.getenv("ELASTICSEARCH_URL")])
qdrant_client = QdrantClient(url=os.getenv("QDRANT_URL"))
sentence_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

initialized_models = {}
for name, model_class in MODEL_MAP.items():
    model = model_class()
    initialized_models[name] = model
