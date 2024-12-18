from typing import Optional
from core.search import search_data
from core.llm import prompt_with_data
from core.rerank import rerank_data


async def repair_data(
    entity_description: str,
    target_name: str,
    target_data: list[dict],
    pivot_names: list[str],
    pivot_data: list[dict],
    reasoner_name: str,
    index_name: Optional[str],
    index_type: Optional[str],
    reranker_type: Optional[str],
) -> dict:

    # print("TARGET DATA", type(target_data), type(target_data[0]), target_data)
    # print("TARGET NAME", type(target_name), target_name)
    # print("PIVOT NAMES", type(pivot_names), pivot_names)
    # print("PIVOT DATA", type(pivot_data), type(pivot_data[0]), pivot_data)
    # Retrieve top-k nearest tuples from the index
    # reranker_type = None  # FOR VLDB DEMO PURPOSES (IT WORKS DW)
    retrieved_list = []
    if index_name is not None:
        search_results = await search_data(
            index_name,
            index_type,
            target_name,  # Name of column to impute [str]
            target_data,  # Value of target column list[strs]
            pivot_names,
            pivot_data,
            reranker_type is not None,
        )

        if search_results["status"] == "fail":
            return search_results
        else:
            retrieved_list = search_results["results"]

    # Rerank search results if reranker is specified

    if reranker_type is not None:
        rerank_results = await rerank_data(
            reranker_type, target_name, pivot_names, pivot_data, retrieved_list
        )

        if rerank_results["status"] == "fail":
            return rerank_results
        else:
            retrieved_list = rerank_results["results"]

    # Call model giving it nearest tuples and target tuple
    prompt_results = await prompt_with_data(
        reasoner_name,
        entity_description,
        target_name,
        target_data,
        pivot_names,
        pivot_data,
        retrieved_list,
    )

    if prompt_results["status"] == "fail":
        return prompt_results
    else:
        results = prompt_results["results"]

    # Return final results to frontend
    # print("*"*50)
    # print("FINAL RETURNED RESULTS: ", results)
    return {"status": "success", "results": results}
