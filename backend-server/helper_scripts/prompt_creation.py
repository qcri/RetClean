print("LOADING helper_script: PROMPT_CREATION")
import numpy as np
import warnings

def prompt_generation(df, col_list, target_col):
    ### Returns list of Serialized Prompts 

    final_prompts_list = []

    for i in range(df.shape[0]):
        row = df.iloc[i]
        prompt = "Context = [ "
        for col in col_list:
            prompt += col + " : " + str(row[col]) + " ; "
        prompt = prompt[:-2] + "] \n"
        prompt += "What should be the missing value for the '{}' attribute for this object?".format(target_col)
        final_prompts_list.append(prompt)    

    return final_prompts_list
