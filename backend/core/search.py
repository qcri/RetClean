from core import es_client, qdrant_client, sentence_model
from core.preprocess import search_preprocess

NO_RERANK_SINGLE_TOP_K = 3
NO_RERANK_MULTIPLE_TOP_K = 2
RERANK_SINGLE_TOP_K = 30
RERANK_MULTIPLE_TOP_K = 15


async def search_data(
    index_name: str,
    index_type: str,
    target_name: str,
    target_data: list[dict],
    pivot_names: list[str],
    pivot_data: list[dict],
    will_rerank: bool = False,
) -> dict:

    ids = [data["id"] for data in target_data]
    target_values = [data["values"] for data in target_data]
    pivot_values = [data["values"] for data in pivot_data]

    # Check if index exists
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "message": "index does not exist"}

    # Determine the number of top-k results to retrieve based on type of index chosen
    if index_type == "both":
        k = RERANK_MULTIPLE_TOP_K if will_rerank else NO_RERANK_MULTIPLE_TOP_K
    else:
        k = RERANK_SINGLE_TOP_K if will_rerank else NO_RERANK_SINGLE_TOP_K

    # Retrieve using chosen index
    results = []
    for pvt_row, tgt in zip(pivot_values, target_values):
        search_results = []
        try:
            if index_type in ["semantic", "both"]:
                # Format data into appropriate query format for Qdrant
                search_query = search_preprocess(
                    "semantic", pivot_names, pvt_row, target_name, tgt
                )
                # Encode Query using Sentence Transformer
                search_query_embedding = sentence_model.encode(search_query).tolist()
                # Get top-k results from Qdrant
                qdrant_results = qdrant_client.search(
                    collection_name=index_name,
                    query_vector=search_query_embedding,
                    limit=k,
                )  # Expected Format: [{"source": str, "table": str, "row": int, "score": float} , {"source": str, "table": str, "row": int, "score": float} , ... ]
                search_results.extend(qdrant_results)

            if index_type in ["syntactic", "both"]:
                # Format data into appropriate query format for ES
                search_query = search_preprocess(
                    "syntactic", pivot_names, pvt_row, target_name, tgt
                )
                search_query_body = {
                    "_source": ["source", "table", "row"],
                    "query": {
                        "match": {
                            "source": {"query": search_query, "fuzziness": "AUTO"}
                        }
                    },
                }
                # Get top-k results from ES
                es_results = es_client.search(
                    index=index_name,
                    body=search_query_body,
                    size=k,
                )  # Expected Format: [{"source": str, "table": str, "row": int, "score": float} , {"source": str, "table": str, "row": int, "score": float} , ... ]
                search_results.extend(es_results["hits"]["hits"])

        except Exception as e:
            return {"status": "fail", "message": str(e)}

        results.append(search_results)

    # results is 2D list where for each target value, we have a list of top-k results
    return {"status": "success", "results": results}
