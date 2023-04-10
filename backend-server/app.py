import pandas as pd
import requests
import time
import os
import torch
import flask
import json
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
CORS(app)


### Load some of the required models
colbert_reranker = load_encoder_reranker("colbert")
crossencoder_reranker = load_encoder_reranker("crossencoder")
faiss_tokenizer_l, faiss_model_l = load_tokenizer_encoder_faiss('facebook/dpr-ctx_encoder-single-nq-base', 'facebook/dpr-ctx_encoder-single-nq-base')

### Parse Request and make dictionary of relevant params. Set all not present to None
def recieve_request_set(info, files):
    json_data = info["json_data"] # Taken from request as is
    dirty_column = info["dirty_column"] # Taken from request as is
    
    # index_name is either provided by the user, or default one is allotted
    if info["index_name"] == None or info["index_name"] == "" or info["index_name"] == 'null':
        index_name = "temp_index_internal"
    else:
        index_name = info["index_name"]

    # entity_described shpuld be given or object if none provided
    if info["entity_described"] == None or info["entity_described"] == "" or info["entity_described"] == 'null':
        entity_described = "Object"
    else:
        entity_described = info["entity_described"]

    # print('type(info["index_type"])', type(info["index_type"]))
    if type(info["index_type"]) != dict and type(info["index_type"]) == str:
        index_type_dict = json.loads(info["index_type"])
    elif type(info["index_type"]) == dict:
        index_type_dict = info["index_type"]
    else:
        raise ValueError("index_type not in correct format")
    
    # print('type(index_type_dict)', type(index_type_dict))
    # print('index_type_dict',index_type_dict)
    # set val for index_type
    if (index_type_dict["ES"] == True and index_type_dict["FAISS"] == True):
        raise ValueError("Atmost 1 Index Type value must be True")
    elif index_type_dict["ES"] == True:
        index_type = "ES"
    elif index_type_dict["FAISS"] == True:
        index_type = "FAISS"
    else:
        index_type = None


    # print('type(info["reasoner_type"])', type(info["reasoner_type"]))
    if type(info["reasoner_type"]) != dict and type(info["reasoner_type"]) == str:
        reasoner_type_dict = json.loads(info["reasoner_type"])
    elif type(info["reasoner_type"]) == dict:
        reasoner_type_dict = info["reasoner_type"]
    else:
        raise ValueError("reasoner_type not in correct format")
    reasoner_type_dict = json.loads(info["reasoner_type"])
    # print('type(index_type_dict)', type(reasoner_type_dict))
    # print('index_type_dict',reasoner_type_dict)
    # set val for reasoner
    if (reasoner_type_dict["chat"] == True and reasoner_type_dict["local"] == True) or (reasoner_type_dict["chat"] == False and reasoner_type_dict["local"] == False):
        raise ValueError("Only & atleast 1 Reasoner type value must be True")
    elif reasoner_type_dict["chat"] == True:
        reasoner_type = "chat"
    elif reasoner_type_dict["local"] == True:
        reasoner_type = "local"
    else:
        reasoner_type = None

    # set finetuning value
    try:
        finetuning_set = pd.read_csv(files["finetuning_set"])
    except:
        finetuning_set = None

    # reranker type
    # print('type(info["reranker_type"])', type(info["reranker_type"]))
    if type(info["reranker_type"]) != dict and type(info["reranker_type"]) == str:
        reranker_type_dict = json.loads(info["reranker_type"])
    elif type(info["reranker_type"]) == dict:
        reranker_type_dict = info["reranker_type"]
    else:
        raise ValueError("reasoner_type not in correct format")
    reranker_type_dict = json.loads(info["reranker_type"])
    # print('type(index_type_dict)', type(reranker_type_dict))
    # print('index_type_dict',reranker_type_dict)
 
    if reranker_type_dict["colbert"] == True and reranker_type_dict["crossencoder"] == True:
        raise ValueError("Atmost 1 Reasoner type value must be True")
    elif reranker_type_dict["colbert"] == True:
        reranker_type = "colbert"
    elif reranker_type_dict["crossencoder"] == True:
        reranker_type = "crossencoder"
    else:
        reranker_type = None

    # Taken as is
    custom_prompt = info["custom_prompt"]
    
    ### Write Datalake CSV Files
    datalake_path, create_index_mode = write_datalake_files(files, index_name) # None when no retrieval is to be done
    
    ### Overwrite index

    # Check needed params
    if json_data == None or dirty_column == None or reasoner_type == None:
        raise ValueError("Data, Dirty Column, and Reasoner Type must be provided")
    
    # Local reasoner but no index chosen
    if reasoner_type == "local" and index_type == None:
        raise ValueError("For local model, retrieval method must be specified")
    
    # Datalake path found (either datalake given or index name or both) but no index_type provided
    # print("datalake_path", datalake_path)
    if datalake_path != None and index_type == None:
        raise ValueError("Retrieval chosen but no index_type provided. or no retrieval make sure index_name and datalake are not provided")

    return {
        "json_data":json_data,
        "dirty_column":dirty_column,
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
# @cross_origin()
def repair_table():

    # print("request.headers",request.headers)
    # print("request.form",request.form)
    # print("%"*100)
    form_as_dict = request.form.to_dict()
    # print("type(form_as_dict)",type(form_as_dict))
    print("form_as_dict", form_as_dict)
    print("%"*100)
    files_as_dict = request.files.to_dict()
    # print("type(files_as_dict)",type(files_as_dict))
    print("files_as_dict", files_as_dict)
    print("%"*100)

    # print("PANDAS READING TEST")
    # df = pd.read_csv(files_as_dict['finetuning_set'])
    
    params = recieve_request_set(form_as_dict,files_as_dict)

    ##### GPT ONLY - Scenario 1
    if params["reasoner_type"] == "chat" and params["index_type"] == None:
        
        ### Load All Query Tuples
        # Convert to Custom Prompt if
        if params["custom_prompt"] != None and params["custom_prompt"] != "" and params["custom_prompt"] != 'null':
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
        
        ret_val = from_string_to_dict(ret_val)
        print("OBJECT RETURNED TO FRONT END:")
        print(ret_results)
        return ret_results

    ##### Ret + GPT - Scenario 2
    elif params["reasoner_type"] == "chat" and params["index_type"] != None:

        # Check if datalake exists
        if params["datalake_path"] == None:
            raise ValueError("Valid datalake not given for retrieval module")

        # Create the index
        main_create_index(params["datalake_path"], params["index_name"], chosen_index_type = params["index_type"], create_index_mode = params["create_index_mode"])

        # Create Query Tuples
        print('params["json_data"]', params["json_data"])
        query_tuples = process_impute_table_from_json(params["json_data"], params["dirty_column"])

        # Send to GPT RET Func
        ret_val = send_gpt_prompts_with_ret(query_tuples, faiss_model_l, faiss_tokenizer_l, params["dirty_column"],
                                         reranker_type = params["reranker_type"], index_name = params["index_name"],
                                           index_type = params["index_type"], object_imp = params["entity_described"])
        
        ret_val = from_string_to_dict(ret_val)
        print("OBJECT RETURNED TO FRONT END:")
        print(ret_val)
        return ret_val

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
        if type(params["finetuning_set"]) == pd.core.frame.DataFrame and params["finetuning_set"].shape[0] > 0:
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
        print("matcher_directory", matcher_directory)
        print("all_retrieved_sets", all_retrieved_sets)

        matched_retrieved_sets = matching(all_retrieved_sets, # format = return by search_index()
                 query_tuples, # str serialized,
                 model_directory = matcher_directory
                )
        print("matched_retrieved_sets", matched_retrieved_sets)
        # Loop over query tuples again to extract value
        if len(query_tuples) != len(matched_retrieved_sets):
            raise ValueError("Number of matched retrieved sets does not equal the number of query tuples")

        
        # Load ST Reasoner
        the_extractor = load_reasoner("ST") # "GPT" to load GPT style extractor/reasoner

        all_extracted_value_objects = []
        for j in range(len(matched_retrieved_sets)):
            print("matched_retrieved_sets[j]", matched_retrieved_sets[j])
            value_t = extraction(matched_retrieved_sets[j],
                                                        params["dirty_column"], # <str> impute attribute name
                                                        mode = "ST", # ST for 'SentenceTransformers' or GPT for GPT3/3.5
                                                        reasoner_model = the_extractor
                                                        )
            print("value_t[0]",type(value_t[0]),value_t[0])
            all_extracted_value_objects.append(value_t[0])
                                                
        all_extracted_value_objects = from_string_to_dict(all_extracted_value_objects)
        print("OBJECT RETURNED TO FRONT END:")
        print(all_extracted_value_objects)
        return all_extracted_value_objects
    else:
        return None

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9690)
