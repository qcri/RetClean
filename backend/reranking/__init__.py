from rerankers import Reranker

# Map model names to their respective classes
RERANKER_MAP = {
    "colbert_reranker": Reranker("colbert")
    # "cross_encoder_reranker" : Reranker("cross_encoder")
}
