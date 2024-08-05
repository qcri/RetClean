from typing import List
from core import es_client, qdrant_client, sentence_model
from core.preprocess import search_preprocess

NO_RERANK_SINGLE_TOP_K = 3
NO_RERANK_MULTIPLE_TOP_K = 2
RERANK_SINGLE_TOP_K = 30
RERANK_MULTIPLE_TOP_K = 15


async def search_data(
    index_name: str,
    index_type: str,
    pivot_names: List[str],
    pivot_values: List[list],
    target_name: str,
    target_values: List[str],
    will_rerank: bool = False,
) -> List[List[dict]]:

    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "message": "index does not exist"}

    if index_type == "both":
        k = RERANK_MULTIPLE_TOP_K if will_rerank else NO_RERANK_MULTIPLE_TOP_K
    else:
        k = RERANK_SINGLE_TOP_K if will_rerank else NO_RERANK_SINGLE_TOP_K

    results = []
    for pvt_row, tgt in zip(pivot_values, target_values):
        search_results = []

        if index_type in ["semantic", "both"]:
            search_query = search_preprocess(
                "semantic", pivot_names, pvt_row, target_name, tgt
            )
            search_query_embedding = sentence_model.encode(search_query).tolist()
            qdrant_results = qdrant_client.search(
                collection_name=index_name,
                query_vector=search_query_embedding,
                limit=k,
            )
            search_results.extend(qdrant_results)

        if index_type in ["syntactic", "both"]:
            search_query = search_preprocess(
                "syntactic", pivot_names, pvt_row, target_name, tgt
            )
            es_results = es_client.search(
                index=index_name,
                body={"query": {"match": {"content": search_query}}},
                size=k,
            )
            search_results.extend(es_results["hits"]["hits"])

        results.append(search_results)

    return results
