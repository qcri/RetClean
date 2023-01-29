print("LOADING helper_script: POST_PROCESSING")
# IMPORTS
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer, util
from transformers import AutoModelForQuestionAnswering, AutoTokenizer, pipeline
import torch
import warnings

import time
from operator import itemgetter

# Load base Model for Embedding Similarity Mapping
post_model_roberta = SentenceTransformer('sentence-transformers/stsb-roberta-large')

# Load base Model for Post Processing Answer Extraction
roberta_qa_model = AutoModelForQuestionAnswering.from_pretrained("../all_models/roberta_base_squad2_local/", local_files_only=True)
roberta_qa_tokenizer = AutoTokenizer.from_pretrained("../all_models/roberta_base_squad2_local/", local_files_only=True)

### Function: Extracts relevant answer from a longer response
def answer_extraction_from_response(response_list, impute_col, given_k=1, qa_model = roberta_qa_model, qa_tokenizer = roberta_qa_tokenizer):
    # Test Print
    print('''
    INSIDE ANSWER EXTRACTION FUNCTION:
    response_list[0] = {}
    response_list[-1] = {}
    impute_col {}
    given_k = {}
    '''.format(response_list[0], response_list[-1], impute_col, given_k))
    
    extracted_answer_list = []
    temp_count = 0
    for response in response_list:
        temp_row_answers = []
        for k in range(given_k):
            context = response[k]
            question = "What is the {} for this object?".format(impute_col)

            inputs = qa_tokenizer(question, context, add_special_tokens=True, return_tensors="pt")
            input_ids = inputs["input_ids"].tolist()[0] # the list of all indices of words in question + context

            # text_tokens = qa_tokenizer.convert_ids_to_tokens(input_ids) # Get the tokens for the question + context
            answer_start_scores, answer_end_scores = qa_model(**inputs, return_dict=False)

            answer_start = torch.argmax(answer_start_scores)  # Get the most likely beginning of answer with the argmax of the score
            answer_end = torch.argmax(answer_end_scores) + 1  # Get the most likely end of answer with the argmax of the score

            answer = qa_tokenizer.convert_tokens_to_string(qa_tokenizer.convert_ids_to_tokens(input_ids[answer_start:answer_end]))

            if temp_count == 0 or temp_count == 2 or temp_count==4:
                print('''
                    response = {} \n
                    temp_count = {} \n
                    context = {} \n
                    question = {} \n
                    answer = {} \n
                '''.format(response, temp_count, context, question, answer))    
            temp_count+=1
            if answer != "<s>":
                temp_row_answers.append(answer)
            else:
                temp_row_answers.append(context)
        extracted_answer_list.append(temp_row_answers)

    return extracted_answer_list

### Function: Maps each GPT3 Response to a the nearest value in the Fixed Category List <all_pos_cats>
def response_mapping_to_fixed_cats(response_list, all_pos_cats, given_k=1, post_model = post_model_roberta):
    if all_pos_cats == [None]: 
        warnings.warn("No Fixed Categories provided. Please set fixed categories using set_fixed_categories_from_df() or set_fixed_categories_from_list() before calling this function")
        return None

    # Take Embeddings of all categories
    cat_embeddings = {}
    for cat in all_pos_cats:
        cat_embeddings[cat] = post_model.encode(cat, convert_to_tensor = True)

    ### Map responses now
    final_answer_list = []
    for i in range(len(response_list)):
        
        response = response_list[i]

        response_embedding = post_model.encode(response[0], convert_to_tensor = True)
        match_dict = {}
        for cat_1 in all_pos_cats:
            cosine_scores = util.pytorch_cos_sim(cat_embeddings[cat_1], response_embedding)
            match_dict[cat_1] = cosine_scores.item()

        ### Get Top match 
        best_match = dict(sorted(match_dict.items(), key = itemgetter(1), reverse = True)[:int(given_k)])

        final_answer_list.append(list(best_match.keys()))
        
    return final_answer_list