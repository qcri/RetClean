def search_preprocess(
    index_type, pivot_names, pivot_row_values, target_name, target_row_value
):
    if index_type == "semantic":
        search_query = {}
        for p, v in zip(pivot_names, pivot_row_values):
            search_query[p] = v
        search_query[target_name] = ""
        search = str(search_query)
    elif index_type == "syntactic":
        search_query = []
        for p, v in zip(pivot_names, pivot_row_values):
            search_query.append(p)
            search_query.append(v)
        search_query.append(target_name)
        search = " ".join(search_query)
    return search


def prompt_preprocess(
    description, target_name, target_row_value, pivot_names, pivot_row_values, context
):
    search_str = str({p: v for p, v in zip(pivot_names, pivot_row_values)})
    # print("DOING PROMPT PROCESS FOR:", search_str)
    # print("CONTEXT:", context)
    # If context is provided, the prompt will include it and ask to use it
    if context:
        # print("", context)
        # Make Context String
        context_str = ", \n".join(
            [
                f"Object {i}: \nAttributes = {context[i]['values']} | table_name = {context[i]['table_name']} | row_number = {context[i]['row_number']}"
                for i in range(len(context))
            ]
        )
        # print("MADE CONTEXT STRING")
        # Make full prompt
        base_prompt = f"""Given the context, provide the value for the missing attribute in the Target Object. Use only the provided context information.
        
Additonal information that may be useful: {description}

Context Objects:
{context_str}

Target Object:
Attributes = { {pivot_names[i]:pivot_row_values['values'][i] for i in range(len(pivot_names))} }
Missing Attribute Name = {target_name}
"""
        # print("MADE BASE PROMPT")
    # If there is no context, the prompt asks the model to use its own information
    else:
        # print("IN THE ELSE")
        base_prompt = f"""Given the Target Object, provide the value for the missing attribute.        

Additonal information that may be useful: {description}

Context: None

Target Object:
Attributes = { {pivot_names[i]:pivot_row_values['values'][i] for i in range(len(pivot_names))} }
Missing Attribute Name = {target_name}
"""
        # print("ELSE PROMPT:", base_prompt)

    ### We are not using entity description right now. Add it later somehow in the base_prompt
    # description_info = f"{description}. " if description else ""

    return base_prompt
