import pandas as pd
import requests
import time
import os
import torch
import flask
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin

from utils import *
from create_index_helper import *
from ret_gpt_helper import *
from ret_local_helper import *
from gpt_only_helper import *
from matcher_finetuning_helper import *
from retrieval_helper import *
from reranker_helper import *

device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Make models folder if it doesnt exist
if not os.path.exists("./models"):
    os.makedirs("./models")

app = Flask('app')
cors = CORS(app)
app.config["CORS_HEADER"] = 'Content-Type'

### Load some of the required models
colbert_reranker = load_encoder_reranker("colbert")
crossencoder_reranker = load_encoder_reranker("crossencoder")
faiss_tokenizer_l, faiss_model_l = load_tokenizer_encoder_faiss('facebook/dpr-ctx_encoder-single-nq-base', 'facebook/dpr-ctx_encoder-single-nq-base')

### Parse Request and make dictionary of relevant params. Set all not present to None
def recieve_request_set(info):
    json_data = info["json_data"] # Taken from request as is
    ditry_column = info["ditry_column"] # Taken from request as is
    
    # index_name is either provided by the user, or default one is allotted
    if info["index_name"] == None:
        index_name = "temp_index_internal"
    else:
        index_name = info["index_name"]

    # entity_described shpuld be given or object if none provided
    if info["entity_described"] == None or info["entity_described"] == "":
        entity_described = "Object"
    else:
        entity_described = info["entity_described"]


    # set val for index_type
    if (info["index_type"]["ES"] == True and info["index_type"]["FAISS"] == True):
        raise ValueError("Atmost 1 Index Type value must be True")
    elif info["index_type"]["ES"] == True:
        index_type = "ES"
    elif info["index_type"]["FAISS"] == True:
        index_type = "FAISS"
    else:
        index_type = None

    # set val for reasoner
    if (info["reasoner_type"]["chat"] == True and info["reasoner_type"]["local"] == True) or (info["reasoner_type"]["chat"] == False and info["reasoner_type"]["local"] == False):
        raise ValueError("Only & atleast 1 Reasoner type value must be True")
    elif info["reasoner_type"]["chat"] == True:
        reasoner_type = "chat"
    elif info["reasoner_type"]["local"] == True:
        reasoner_type = "local"
    else:
        reasoner_type = None

    # set finetuning value
    finetuning_set = recieved_json_to_pdf(info["finetuning_set"])

    # reranker type
    if info["reranker_type"]["colbert"] == True and info["reranker_type"]["crossencoder"] == True:
        raise ValueError("Atmost 1 Reasoner type value must be True")
    elif info["reranker_type"]["colbert"] == True:
        reranker_type = "colbert"
    elif info["reranker_type"]["crossencoder"] == True:
        reranker_type = "crossencoder"
    else:
        reranker_type = None

    # Taken as is
    custom_prompt = info["custom_prompt"]
    
    ### Write Datalake CSV Files
    datalake_path, create_index_mode = write_datalake_files(info["datalake"], index_name) # None when no retrieval is to be done
    
    ### Overwrite index

    # Check needed params
    if json_data == None or ditry_column == None or reasoner_type == None:
        raise ValueError("Data, Dirty Column, and Reasoner Type must be provided")
    
    # Local reasoner but no index chosen
    if reasoner_type == "local" and index_type == None:
        raise ValueError("For local model, retrieval method must be specified")
    
    # Datalake path found (either datalake given or index name or both) but no index_type provided
    if datalake_path != None and index_type == None:
        raise ValueError("Retrieval chosen but no index_type provided. or no retrieval make sure index_name and datalake are not provided")

    return {
        "json_data":json_data,
        "dirty_column":ditry_column,
        "index_name" : index_name,
        "index_type":index_type,
        "reasoner_type":reasoner_type,
        "finetuning_set":finetuning_set,
        "reranker_type":reranker_type,
        "custom_prompt":custom_prompt,
        "entity_described" : entity_described,
        "datalake_path" : datalake_path,
        "create_index_mode" : create_index_mode
    }

@app.route('/repair_table', methods=['POST'])
def repair_table():

    params = recieve_request_set(request.json)

    ##### GPT ONLY - Scenario 1
    if params["reasoner_type"] == "chat" and params["index_type"] == None:
        
        ### Load All Query Tuples
        # Convert to Custom Prompt if
        if params["custom_prompt"] != None and params["custom_prompt"] != "":
            query_tuples = custom_prompt_convert(params["json_data"], params["custom_prompt"], params["dirty_column"])
            repairs = send_gpt_prompts_single(None, params["dirty_column"], custom_prompt_list = query_tuples)
        else:
            query_tuples = process_impute_table_from_json(params["json_data"], params["dirty_column"])
            repairs = send_gpt_prompts_single(query_tuples, params["dirty_column"], custom_prompt_list = None)

        size_of_repairs = len(repairs)

        ret_results = [{
            "repair" : repairs[i],
            "source" : "",
            "table" : "",
            "index" : ""
                    } for i in range(size_of_repairs)] 


        return ret_results

    ##### Ret + GPT - Scenario 2
    elif params["reasoner_type"] == "chat" and params["index_type"] != None:

        # Check if datalake exists
        if params["datalake_path"] == None:
            raise ValueError("Valid datalake not given for retrieval module")

        # Create the index
        main_create_index(params["datalake_path"], params["index_name"], chosen_index_type = params["index_type"], create_index_mode = params["create_index_mode"])

        # Create Query Tuples
        query_tuples = process_impute_table_from_json(params["json_data"], params["dirty_column"])

        # Send to GPT RET Func
        return send_gpt_prompts_with_ret(query_tuples, faiss_model_l, faiss_tokenizer_l, params["dirty_column"],
                                         reranker_type = params["reranker_type"], index_name = params["index_name"],
                                           index_type = params["index_type"], object_imp = params["entity_described"])

    ##### Ret + Local - Scenario 3
    elif params["reasoner_type"] == "local" and params["index_type"] != None:

        # Check if datalake exists
        if params["datalake_path"] == None:
            raise ValueError("Valid datalake not given for retrieval module")
        
        # Create the index
        main_create_index(params["datalake_path"], params["index_name"], chosen_index_type = params["index_type"], create_index_mode = params["create_index_mode"])

        # Create Query Tuples
        query_tuples = process_impute_table_from_json(params["json_data"], params["dirty_column"])
        matcher_directory = 'shamz15531/roberta_tuple_matcher_base' # base model 
        if params["reranker_type"] != None:
            reranker_model = load_encoder_reranker(mode=params["reranker_type"])


        # Check if finetuning required 
        if type(params["finetuning_set"]) == pd.core.frame.DataFrame:
            if not os.path.exists("./finetuning_sets/"):
                os.makedirs("./finetuning_sets/")

            # Make FT File name
            fname_to_save = "ft_set_{}.csv".format(time.strftime("%Y%m%d-%H%M%S"))

            # Save FT Set as CSV
            params["finetuning_set"].to_csv("./finetuning_sets/{}".format(fname_to_save), index=False) 

            # Create & Save FT model
            saved_model_name = "matcher_ft_{}.csv".format(time.strftime("%Y%m%d-%H%M%S"))
            matcher_directory = finetuning_matcher(fname_to_save, "./models/{}/".format(saved_model_name))

        # Loop Over query_tuples to get retreived for each
        all_retrieved_sets = []
        for query_t in query_tuples:
                retrieved_set_l = (search_index(query_t, # str format, serialized
                                        "./tmp/aggregation_{}.csv".format(params["index_name"]),
                                        "./faiss_index/", # Fixed - DO NOT CHANGE
                                        params["index_name"],
                                        encoder = faiss_model_l,
                                        tokenizer = faiss_tokenizer_l,
                                        index_type = params["index_type"],
                                        k = 5, # number of tuples to retrieve
                                        )
                                    )
                # # Reranking
                if params["reranker_type"] == "colbert":
                    retrieved_set_l = colbert_like_rerank(query_t, retrieved_set_l, reranker_model)
                if params["reranker_type"] == "crossencoder":
                    retrieved_set_l = cross_encoder_based_rerank(query_t, retrieved_set_l, reranker_model)

                all_retrieved_sets.append(retrieved_set_l)
        
        matched_retrieved_sets = matching(all_retrieved_sets, # format = return by search_index()
                 query_tuples, # str serialized,
                 model_directory = matcher_directory
                )
        
        # Loop over query tuples again to extract value
        if len(query_tuples) != len(matched_retrieved_sets):
            raise ValueError("Number of matched retrieved sets does not equal the number of query tuples")

        
        # Load ST Reasoner
        the_extractor = load_reasoner("ST") # "GPT" to load GPT style extractor/reasoner

        all_extracted_value_objects = []
        for j in range(len(matched_retrieved_sets)):
            all_extracted_value_objects.append(extraction(matched_retrieved_sets[j],
                                                        params["dirty_column"], # <str> impute attribute name
                                                        mode = "ST", # ST for 'SentenceTransformers' or GPT for GPT3/3.5
                                                        reasoner_model = the_extractor
                                                        )
                                                )
            
        return all_extracted_value_objects
    else:
        return None

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9690)
