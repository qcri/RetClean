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
    
    # If context is provided, the prompt will include it and ask to use it
    if context:
        # Make Context String 
        context_str = ", \n".join(
            [
                f"Object {i}: \nAttributes = {context[i]['values']} | Citation = {context[i]['table_name']}_{context[i]['row_number']}"
                for i in range(len(context))
            ]
        )

        # Make full prompt
        base_prompt = f'''Given the context, provide the value for the missing attribute in the Target Object. Use only the provided context information.
        Context Objects:
        {context_str}
        
        Target Object:
        Attributes = {target_row_value}
        Missing Attribute Name = {target_name}
        '''

    # If there is no context, the prompt asks the model to use its own information
    else:
        base_prompt = f'''Given the Target Object, provide the value for the missing attribute.        
        Target Object:
        Attributes = {target_row_value}
        Missing Attribute Name = {target_name}
        '''

    ### We are not using entity description right now. Add it later somehow in the base_prompt
    # description_info = f"{description}. " if description else ""

    return base_prompt
