from typing import Optional
from core import initialized_models
from core.preprocess import prompt_preprocess


async def prompt_with_data(
    model_name: str,
    description: Optional[str],
    target_name: str,
    target_values: list[str],
    pivot_names: list[str],
    pivot_values: list[list],
    retrieved_list: list[list],
) -> dict:

    # Get model from initialized models
    if model_name not in initialized_models:
        return {"status": "fail", "message": "model not found"}

    model = initialized_models[model_name]

    if retrieved_list == []:
        retrieved_list = [None for _ in range(len(target_values))]

    retrieved_list = [x if x != None and len(x) > 0 else None for x in retrieved_list]

    # Get the result for each target value
    results = []
    for target_row_value, pivot_row_values, retrieved in zip(
        target_values, pivot_values, retrieved_list
    ):
        # Create prompt using context
        prompt = prompt_preprocess(
            description,
            target_name,
            target_row_value,
            pivot_names,
            pivot_row_values,
            retrieved,
        )

        try:
            wrapped_text = model.prompt_wrapper(prompt)  # Creates final prompt
            response = model.generate(
                wrapped_text,
                retrieved # None if no context given
            )  # Generates response, return dict with 'value' and 'citation'
        except Exception as e:
            return {"status": "fail", "message": str(e)}

        results.append(response)

    return {"status": "success", "results": results}


def get_models() -> dict:
    cloud = {"name": "Cloud Models", "options": []}
    local = {"name": "Local Models", "options": []}

    try:
        for name, model in initialized_models.items():
            if model.type == "cloud":
                cloud["options"].append(name)
            else:
                local["options"].append(name)
        model_names = [cloud, local]

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success", "models": model_names}
