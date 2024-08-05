# TODO
# If target_row_value is present,
# we want to add additional error detection


def search_preprocess(
    index_type, pivot_names, pivot_row_values, target_name, target_row_value
):
    if index_type == "semantic":
        search_query = {}
        for p, v in zip(pivot_names, pivot_row_values):
            search_query[p] = v
        search_query[target_name] = ""
        search = str(search_query)
    elif index_type == "lexicographic":
        search_query = {}
        for p, v in zip(pivot_names, pivot_row_values):
            search_query[p] = v
        search_query[target_name] = ""
        search = str(search_query)
    return search


def prompt_preprocess(
    pivot_names, pivot_row_values, target_name, target_row_value, context
):
    search_query = {}
    for p, v in zip(pivot_names, pivot_row_values):
        search_query[p] = v

    # IF target_row_value is present,
    # we want to add additional error detection

    base_query = str(search_query)
    if context is not None:
        prompt = f"Given the following {context}, provide the concise value of {target_name} for base query: {base_query}"
    else:
        prompt = (
            f"Provide the concise value of {target_name} for base query: {base_query}"
        )

    return prompt
