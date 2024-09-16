from rerankers import Reranker

# Map model names to their respective classes
RERANKER_MAP = {
    "ColBERT": Reranker("colbert")
    # "cross_encoder_reranker" : Reranker("cross_encoder")
}
