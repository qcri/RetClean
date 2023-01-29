# IMPORTS
import io
import string
import time
import os
import random
import json

import pandas as pd
import numpy as np
import pickle
import warnings

import flask
from flask import Flask, jsonify, request, render_template
from flask_cors import CORS, cross_origin

import sentencepiece
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# Import Relevant Helper Scripts & Functions
from helper_scripts.prompt_creation import prompt_generation
from helper_scripts.post_processing import response_mapping_to_fixed_cats
from helper_scripts.prompt_response import *


app = Flask('app')
cors = CORS(app)
app.config["CORS_HEADER"] = 'Content-Type'



### load spark session for gpt3
print("NEW TEMP VERSION 0.80")
print("CREATING SPARK SESSION")
initial_spark_session = create_spark_session()
print("CREATING SPARK SESSION")

print("------------------ READY TO RECIEVE REQUESTS ------------------")

@app.route('/')
@cross_origin()
def home():
    return render_template('./home_page.html')

@app.route('/test_ping', methods=['GET'])
@cross_origin()
def test_ping():
    return "Ping Succesful"

# @app.route('/testfile', methods=['POST'])
# @cross_origin()
# def test_file_recieve():
#     df_in_json = request.values["file"]
#     cols_to_keep =  request.values["cols_to_use"]
#     imp_col =  request.values["impute_col"]
#     data = json.loads(df_in_json)
#     df = pd.DataFrame.from_records(data)
#     ret_df = df.to_json(orient='columns')

#     return ret_df

### GPT3 First Method for PYTHON FRONT END
@app.route('/impute_gpt3_py', methods=['POST'])
@cross_origin()
def impute_gpt3_py(inital_spark = initial_spark_session):

    df_in_json = request.values["json"] ### Get DF as json file
    data = json.loads(df_in_json)
    df = pd.DataFrame.from_records(data)

    cols_to_use =  request.values["cols_to_use"].split("||")  # Get List of Cols to keep from request

    impute_col =  request.values["impute_col"] # Get Impute Col Name as String from request

    k =  request.values["k"] # Get K as Int from request
    k = int(k)

    use_fixed_cats =  request.values["use_fixed_cats"] # Get use_fixed_cats as Bool from request
    use_fixed_cats = True if use_fixed_cats == 'True' else False

    given_fixed_cats = request.values["given_fixed_cats"] # Get fixed cats if any given
    given_fixed_cats = given_fixed_cats.split("||") if given_fixed_cats != 'None' else None

    impute_and_repair = request.values["impute_and_repair"] # "True" or "False" for whether to make prompts for only missing vals or all rows
    impute_and_repair = True if impute_and_repair == 'True' else False

    print("DF SHAPE = {} \nDF COLUMNS = {} \nEXAMPLE VAL = {}".format(str(df.shape), ', '.join(list(df.columns)), df.iloc[0][df.columns[0]])) # Print info about df
    
    df = df.head(50)

    print("DF SHAPE = {} \nDF COLUMNS = {} \nEXAMPLE VAL = {}".format(str(df.shape), ', '.join(list(df.columns)), df.iloc[0][df.columns[0]])) # Print info about df

    s1 = time.time()
    prompts = prompt_generation(df, cols_to_use, impute_col, impute_and_repair) ### Create Prompts From DF
    print("TIME TAKEN FOR {} promtps is {} seconds".format(len(prompts), time.time()-s1))
    print("SAMPLE PROMPT : {}".format(prompts[0]))

    s2 = time.time()
    generated_responses_list, k_responses = prompt_response_gpt3(prompts, k, use_fixed_cats, given_fixed_cats = given_fixed_cats, spark_session = inital_spark)
    print("TIME TAKEN FOR {} Prompt Responses is {} seconds".format(len(generated_responses_list), time.time()-s2))

    generated_responses_dictionary = {}
    ### intiailize values for k responses 
    for temp_k in range(k_responses):
        generated_responses_dictionary["Choice "+str(temp_k+1)] = []

    ### Going over responses and putting them in respective dictionary values (i.e columns)
    for response_number in range(len(generated_responses_list)):
        if generated_responses_list[response_number] == None:
            for k_index in range(k_responses):
                generated_responses_dictionary["Choice "+str(k_index+1)].append("")
        else:
            for k_index in range(k_responses):
                generated_responses_dictionary["Choice "+str(k_index+1)].append(generated_responses_list[response_number][k_index])

    ### Conver response dictionary to pandas.DataFrame
    generated_responses_df = pd.DataFrame(generated_responses_dictionary)

    generated_response_df_json = generated_responses_df.to_json(orient='columns') ### Convert df to json to send be to imputer_class

    return generated_response_df_json

#################################################################################################################################################

#################################################################################################################################################

#################################################################################################################################################   

### GPT3 Second Method for REACT FRONT END
@app.route('/impute_gpt3_react', methods=['POST'])
@cross_origin()
def impute_gpt3_react(inital_spark = initial_spark_session):

    ### Assumption in React Front end is that user subsets the data based on whatever their params are and keep (& send) columns and rows that they want imputed
    ### Hence, all columns that != impute_column are to be used in prompt generation. 
    
    # print('request', request)
    # print('request.values', request.values)
    # print('request.data', request.data)
    # print('TYPE request.data', type(request.data))
    print("request.json", request.json)
    print('TYPE request.json', type(request.json))
    # data_decoded = request.content.decode('utf-8', errors="replace")
    # print("data_decoded", data_decoded)
    # print('data_decoded', type(data_decoded))

    df_in_json = request.json["table"] ### Get DF as json file
    print("type(df_in_json)", type(df_in_json))
    print(df_in_json)
    # data = json.loads(df_in_json)
    # df = pd.DataFrame.from_records(data)
    df = pd.DataFrame.from_dict(df_in_json)
    print("type(df)", type(df))
    print("df.columns", df.columns)

    impute_col =  request.json["impute_col"] # Get Impute Col Name as String from request
    print("impute_col", impute_col)
    print("type(impute_col)", type(impute_col))

    cols_to_use = list(df.columns)
    cols_to_use.remove(impute_col)
    print("cols_to_use", cols_to_use)
    print("type(cols_to_use)", type(cols_to_use))

    k =  request.json["k"] # Get K as Int from request
    k = int(k)

    print("k", k)
    print("type(k)", type(k))
    # try:
    #     impute_and_repair = request.values["impute_and_repair"] # "True" or "False" for whether to make prompts for only missing vals or all rows
    #     impute_and_repair = True if impute_and_repair == 'True' else False
    # except:
    #     impute_and_repair = True
    use_fixed_cats =  request.json["use_fixed_cats"] # Get use_fixed_cats as Bool from request
    use_fixed_cats = True if use_fixed_cats == 'True' else False

    print("use_fixed_cats", use_fixed_cats)
    print("type(use_fixed_cats)", type(use_fixed_cats))

    if use_fixed_cats:
        given_fixed_cats = request.json["given_fixed_cats"] # Get fixed cats if any given
        given_fixed_cats = given_fixed_cats.split("||") if given_fixed_cats != 'None' else None
    else:
        given_fixed_cats = None

    print("given_fixed_cats", given_fixed_cats)
    print("type(given_fixed_cats)", type(given_fixed_cats))

    print("DF SHAPE = {} \nDF COLUMNS = {} \nEXAMPLE VAL = {}".format(str(df.shape), ', '.join(list(df.columns)), df.iloc[0][df.columns[0]])) # Print info about df

    # df = df.head(20)

    print("DF SHAPE = {} \nDF COLUMNS = {} \nEXAMPLE VAL = {}".format(str(df.shape), ', '.join(list(df.columns)), df.iloc[0][df.columns[0]])) # Print info about df

    s1 = time.time()
    prompts = prompt_generation(df, cols_to_use, impute_col) ### Create Prompts From DF
    print("TIME TAKEN FOR {} promtps is {} seconds".format(len(prompts), time.time()-s1))
    print("SAMPLE PROMPT : {}".format(prompts[0]))

    s2 = time.time()
    generated_responses_list, k_responses = prompt_response_gpt3(prompts, k, use_fixed_cats, impute_col_name= impute_col, given_fixed_cats = given_fixed_cats, spark_session = inital_spark)
    print("TIME TAKEN FOR {} Prompt Responses is {} seconds".format(len(generated_responses_list), time.time()-s2))

    generated_responses_dictionary = {}
    ### intiailize values for k responses 
    for temp_k in range(k_responses):
        generated_responses_dictionary["Choice "+str(temp_k+1)] = []

    ### Going over responses and putting them in respective dictionary values (i.e columns)
    for response_number in range(len(generated_responses_list)):
        for k_index in range(k_responses):
            generated_responses_dictionary["Choice "+str(k_index+1)].append(generated_responses_list[response_number][k_index])

    ### Conver response dictionary to pandas.DataFrame
    generated_responses_df = pd.DataFrame(generated_responses_dictionary)
    # print(generated_responses_df.head())
    # generated_response_df_json = generated_responses_df.to_json(orient='columns') ### Convert df to json to send be to imputer_class
    # print(generated_response_df_json)
    generated_response_dict = generated_responses_df.to_dict()
    generated_response_dict_formatted = {}
    for key, val in generated_response_dict.items():
        temp_list = [val2 for key2,val2 in val.items()]
        generated_response_dict_formatted[key] = temp_list

    responses_json = json.dumps(generated_response_dict_formatted)
    # print(responses_json)
    return responses_json


########################################################################################################################################################################################################################
########################################################################################################################################################################################################################
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9690)
