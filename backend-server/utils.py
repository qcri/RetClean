import time
import os
import pandas as pd
import json
from transformers import DPRContextEncoder, DPRContextEncoderTokenizer
import torch 
import warnings
import shutil

device = 'cuda' if torch.cuda.is_available() else 'cpu'

def tuple_serializer(tuple_t, target_att=None): 
    ### returns string of serialized tuple
    arr = [(col.replace('\r\n', ' ').replace('\n',  ' '), str(tuple_t[col]).replace('\r\n', ' ').replace('\n',  ' ')) for col in tuple_t.index]
    serialization = (' ; ').join([ f'{pair[0]} : {pair[1]}' for pair in arr])
    if target_att is not None:
        serialization = f'{serialization} ; {target_att} : '
    serialized_tuple = f'[ {serialization} ]'
    return serialized_tuple

# Process impute table (make list of serialized tuples)
def process_impute_table(path, impute_att, prepare_for_test = False):
    ret = []
    df = pd.read_csv(path)
    if prepare_for_test:
        df = df[[x for x in list(df.columns) if x != impute_att]]
    df = df[[col for col in list(df.columns) if "Unnamed" not in col]]
    for i in range(df.shape[0]):
        row = df.iloc[i, :]
        ret.append(tuple_serializer(row,impute_att))
    return ret

# Write all csv files to datalake folder
def write_datalake_files(list_of_csvs, index_name): # index_name is the folder name in ./datalake for this datalake
    # No datalake provded
    if list_of_csvs == None or list_of_csvs == [] or list_of_csvs == [{} , {}]:
        # Case 1: No datalake , no index_name [Meaning no Retrieval to be done]
        if index_name == "temp_index_internal":
            return None, "no_retrieval"
        # Case 2: No datalake, but existing index_name provided
        else:
            if os.path.exists("./datalakes/{}".format(index_name)):
                return "./datalakes/{}".format(index_name), "check_index" 
            else:
                raise ValueError("No index with provided name exists, and no datalake is provided to create a new one.")
            
    # Data Lake Provided
    else:
        # Case 3: Datalake , index_name
        dirpath = "./datalakes/{}".format(index_name)
        # Delete existing temp_index_internal directory
        if os.path.exists(dirpath) and os.path.isdir(dirpath):
            if index_name != "temp_index_internal":
                warnings.warn("Index with this name already exists. Overwriting existing index.")
            shutil.rmtree(dirpath)

        # Make New One
        os.makedirs("./datalakes/{}".format(index_name))
        
        # Loop over list of csvs
        # write each one to new folder path
        # .
        # .
        # .
        ####
        return "./datalakes/{}".format(index_name), "create_index"

# Takes JSON files form front end and returns Pandas DF
def recieved_json_to_pdf(json_dict):
    if json_dict == None:
        return None
    data = json.loads(json_dict)
    df = pd.DataFrame.from_records(data)
    return df

# Process impute table (make list of serialized tuples)
def process_impute_table_from_json(json_data, impute_att, prepare_for_test = False):
    ret = []
    df = recieved_json_to_pdf(json_data)
    if prepare_for_test:
        df = df[[x for x in list(df.columns) if x != impute_att]]
    df = df[[col for col in list(df.columns) if "Unnamed" not in col]]
    for i in range(df.shape[0]):
        row = df.iloc[i, :]
        ret.append(tuple_serializer(row,impute_att))
    return ret

# Helper Function 
def encode_data(dataset, encoder, tokenizer, device):
    ds_with_embeddings = dataset.map(lambda example: {
                                     'embeddings':encoder(
                                         **tokenizer(example['serialization'], return_tensors='pt', truncation= True).to(device)
                                     )[0][0].detach().cpu().numpy()
    })
    return ds_with_embeddings


def load_tokenizer_encoder_faiss(tokenizer_path, encoder_path):
    encoder = DPRContextEncoder.from_pretrained(encoder_path).to(device)
    tokenizer = DPRContextEncoderTokenizer.from_pretrained(tokenizer_path, truncation = True, max_length = 512)
    return tokenizer, encoder

def read_json(path):
    with open(path,"r") as f1:
        ret = json.load(f1)
    return ret
    
def save_json(path, x):
    with open(path,"w") as f1:
        ret = json.dump(x,f1)
    return True
