import pandas as pd
import numpy as np
import torch
import openai
import time
import torch
from utils import *

device = 'cuda' if torch.cuda.is_available() else 'cpu'
    
def custom_prompt_convert(json_data, custom_prompt, impute_att):
    df = recieved_json_to_pdf(json_data)
    prompt_words = custom_prompt.split(' ')
    final_prompt_list = []
    for i in range(df.shape[0]):
        row = df.iloc[i,:]    
        ret_prompt_words = []
        for word in prompt_words:
            if word[0] == "$" and word[-1] == "$":
                ret_prompt_words.append(str(row[word[1:-1]]))
            else:
                ret_prompt_words.append(word)
        final_prompt_list.append(' '.join(ret_prompt_words))
    
    return final_prompt_list

def send_gpt_prompts_single(all_query_tuples_serialized, missing_att, custom_prompt_list = None):

    ### GPT3.5 Params
    service_name = "dataprepopenai2"
    deployment_name = "retclean_gpt35"#"retclean_gpt35"
    key = "5b8e613900314c6e95839d5509fbea80"  # please replace this with your key as a string

    openai.api_key = key
    openai.api_base =  "https://{}.openai.azure.com/".format(service_name) # your endpoint should look like the following https://YOUR_RESOURCE_NAME.openai.azure.com/
    openai.api_type = 'azure'
    openai.api_version = '2022-06-01-preview' # this may change in the future

    deployment_id=deployment_name #This will correspond to the custom name you chose for your deployment when you deployed a model. 

    ### Main Loop
    final_answers = []

    if custom_prompt_list != None:
        for i in range(len(custom_prompt_list)):
            query = custom_prompt_list[i]
            prompt="<|im_start|>system\nThe system is an AI assistant that helps users get relevant information and answers.\n<|im_end|>\n<|im_start|>user\n{}\n<|im_end|>\n<|im_start|>assistant".format(query)
            print(prompt)
            response1 = openai.Completion.create(engine="gpt3_davinci_imputer", prompt=prompt,
                                            temperature=0.2,
                                            max_tokens=32,
                                            top_p=0.95,
                                            frequency_penalty=0.5,
                                            presence_penalty=0.5,
                                            stop=["<|im_end|>"])
            txt = response1["choices"][0]["text"]
            final_answers.append(txt)
            time.sleep(0.3)
    
    else:
        for i in range(len(all_query_tuples_serialized)):
            query = all_query_tuples_serialized[i]
            prompt="<|im_start|>system\nThe system is an AI assistant that helps users get relevant information and answers.\n<|im_end|>\n<|im_start|>user\nTuple 1 = {} What should be the {} value for Tuple 1?\n<|im_end|>\n<|im_start|>assistant".format(query, missing_att)
            response1 = openai.Completion.create(engine="gpt3_davinci_imputer", prompt=prompt,
                                            temperature=0.2,
                                            max_tokens=32,
                                            top_p=0.95,
                                            frequency_penalty=0.5,
                                            presence_penalty=0.5,
                                            stop=["<|im_end|>"])
            txt = response1["choices"][0]["text"]
            final_answers.append(txt)
            time.sleep(0.3)
    return final_answers
        

print("LOADED gpt_only_helper")