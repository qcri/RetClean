def search_preprocess(
    index_type, target_name, target_row_value, pivot_names, pivot_row_values
):
    if index_type == "semantic":
        search_query = {}
        for p, v in zip(pivot_names, pivot_row_values):
            search_query[p] = v
        search_query[target_name] = ""
        search = str(search_query)
    elif index_type == "syntactic":
        search_query = {}
        for p, v in zip(pivot_names, pivot_row_values):
            search_query[p] = v
        search_query[target_name] = ""
        search = str(search_query)
    return search


def prompt_preprocess(
    description, target_name, target_row_value, pivot_names, pivot_row_values, context
):
    search_str = str({p: v for p, v in zip(pivot_names, pivot_row_values)})
    base_query = f"Provide the concise value of {target_name} for the row {search_str}."

    if context:
        context_str = ", ".join(
            [
                f"{obj['source']}, table: {obj['table']}, row: {obj['row']}"
                for obj in context
            ]
        )
        context_info = f"You're given the following context: {context_str}. "
    else:
        context_info = ""

    description_info = f"{description}. " if description else ""

    prompt = f"{description_info}{context_info}{base_query}"

    return prompt
