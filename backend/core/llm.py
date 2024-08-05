from typing import List, Optional
from core import initialized_models
from core.preprocess import prompt_preprocess


async def prompt_with_data(
    model_name: str,
    pivot_names: List[str],
    pivot_values: List[list],
    target_name: str,
    target_values: List[str],
    contexts: Optional[List] = None,
) -> List[str]:

    model = initialized_models[model_name]

    if contexts is None:
        contexts_list = [None for _ in range(len(contexts))]
    else:
        contexts_list = context

    results = []
    for pvt_row, tgt in zip(pivot_values, target_values):
        generative_results = []
        for context in contexts_list:
            prompt = prompt_preprocess(pivot_names, pvt_row, target_name, tgt, context)
            wrapped_text = model.prompt_wrapper(prompt)
            try:
                response = model.generate(wrapped_text)
            except Exception as e:
                return {"status": "fail", "message": str(e)}

            generative_results.append(response)

        results.append(generative_results)

    return {
        "status": "success",
        "message": "Generations successful",
        "results": results,
    }


def get_models() -> List[dict]:
    try:
        model_list = [
            {"model_name": name, "model_type": model.type}
            for name, model in initialized_models.items()
        ]
    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success", "results": model_list}
