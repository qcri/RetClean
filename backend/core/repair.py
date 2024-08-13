from typing import Optional
from core.search import search_data
from core.llm import prompt_with_data


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

    # Retrieve top-k nearest tuples from the index
    retrieved_list = []
    if index_name is not None:
        search_results = await search_data(
            index_name,
            index_type,
            target_name,
            target_data,
            pivot_names,
            pivot_data,
            reranker_type is not None,
        )

        if search_results["status"] == "fail":
            return search_results
        else:
            retrieved_list = search_results["results"]

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
    return {"status": "success", "results": results}
