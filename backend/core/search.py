import re
from core.preprocess import search_preprocess
from core import es_client, qdrant_client, sentence_model

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
    target_values = [data["value"] for data in target_data]
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
        # print("*"*50)
        # print("DOING", pvt_row)
        search_results = []
        try:
            if index_type in ["semantic", "both"]:
                # Format data into appropriate query format for Qdrant
                search_query = search_preprocess(
                    index_type="semantic",
                    pivot_names=pivot_names,
                    pivot_row_values=pvt_row,
                    target_name=target_name,
                    target_row_value=tgt,
                )

                # Encode Query using Sentence Transformer
                search_query_embedding = sentence_model.encode(search_query).tolist()

                # Get top-k results from Qdrant
                qdrant_results = qdrant_client.search(
                    collection_name=index_name,
                    query_vector=search_query_embedding,
                    limit=k,
                )  # Expected Format: [{"values": str, "table_name": str, "row_number": int, "score": float} , {"values": str, "table_name": str, "row_number": int, "score": float} , ... ]

                qdrant_results_formatted = [
                    {
                        "values": x.payload["values"],
                        "table_name": x.payload["table_name"],
                        "row_number": x.payload["row_number"],
                    }
                    for x in qdrant_results
                ]

                search_results.append(qdrant_results_formatted)

            if index_type in ["syntactic", "both"]:
                # Format data into appropriate query format for ES
                search_query = search_preprocess(
                    "syntactic", pivot_names, pvt_row, target_name, tgt
                )

                search_query_body = {
                    "_source": ["values", "table_name", "row_number"],
                    "query": {
                        "match": {
                            "values": {"query": search_query, "fuzziness": "AUTO"}
                        }
                    },
                }
                # Get top-k results from ES
                es_results = es_client.search(
                    index=index_name,
                    body=search_query_body,
                    size=k,
                )  # Expected Format: [{"values": str, "table_name": str, "row_number": int, "score": float} , {"values": str, "table_name": str, "row_number": int, "score": float} , ... ]

                # print("RESULTS:", es_results["hits"]["hits"])
                # print("PARSED RESULTS:", [x1["_source"] for x1 in es_results["hits"]["hits"]])
                # search_results = [x1["_source"] for x1 in es_results["hits"]["hits"]]
                # print("ES RESULTS (SINGLE)", [{**x1["_source"], "values": format_string_for_eval("{ " + x1["_source"]["values"].strip()[:-2] + " }").replace(" '", "'")} for x1 in es_results["hits"]["hits"]])
                search_results.append(
                    [
                        {
                            **x1["_source"],
                            "values": format_string_for_eval(
                                "{ " + x1["_source"]["values"].strip()[:-2] + " }"
                            ).replace(" '", "'"),
                        }
                        for x1 in es_results["hits"]["hits"]
                    ]
                )

        except Exception as e:
            print("ERROR HERE 111", e)
            return {"status": "fail", "message": str(e)}

        # Flattten in case both indexes are used
        if search_results != [] and type(search_results[0]) == list:
            search_results = [item for sublist in search_results for item in sublist]
        # print("SEARCH RESULTS", type(search_results), type(search_results[0]), search_results)
        results.append(search_results)

    # results is 2D list where for each target value, we have a list of top-k results
    # print("SEARCH RESULTS", type(results), results)
    return {"status": "success", "results": results}


# Helper Function to format the values attribute for ES returned results
def format_string_for_eval(s):
    # Add quotes around keys
    s = re.sub(r"(\w+)\s*:", r"'\1':", s)
    # Add quotes around all values
    s = re.sub(r":\s*([^,}]+)", r": '\1'", s)
    # Handle None values
    s = s.replace(": 'None'", ": None")
    return s
