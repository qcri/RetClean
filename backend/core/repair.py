from typing import List, Optional, Dict
from core.search import search_data
from core.llm import prompt_with_data


async def repair_data(
    index_name: Optional[str],
    index_type: Optional[str],
    reranker_type: Optional[str],
    language_model_name: str,
    pivot_names: List[str],
    pivot_data: List[Dict],
    target_name: str,
    target_data: List[Dict],
) -> dict:
    ids = [x["id"] for x in pivot_data]
    pivot_values = [x["values"] for x in pivot_data]
    target_values = [x["value"] for x in target_data]

    search_results = []
    if index_name is not None:
        search_results = await search_data(
            index_name,
            index_type,
            pivot_names,
            pivot_values,
            target_name,
            target_values,
        )
        if search_results["status"] == "fail":
            return search_results

    prompt_results = await prompt_with_data(
        language_model_name,
        search_results,
        pivot_names,
        pivot_values,
        target_name,
        target_values,
    )
    if prompt_results["status"] == "fail":
        return prompt_results

    results = [{"id": x, "candidates": y} for x, y in zip(ids, prompt_results)]
    return {
        "status": "success",
        "message": "Repair results available",
        "results": results,
    }
