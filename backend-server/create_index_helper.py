import os
import pandas as pd
import torch
from datasets import Dataset
from transformers import DPRContextEncoder, DPRContextEncoderTokenizer
from elasticsearch import Elasticsearch
from utils import *
# NEED TO INSTALL FAISS-GPU AS WELL

device = 'cuda' if torch.cuda.is_available() else 'cpu'


######### HELPERS

# Loads models to create Embeddings for FAISS
def load_tokenizer_encoder(tokenizer_path, encoder_path):
    encoder = DPRContextEncoder.from_pretrained(encoder_path).to(device)
    tokenizer = DPRContextEncoderTokenizer.from_pretrained(tokenizer_path, truncation = True, max_length = 512)
    return tokenizer, encoder

# Deletes elastic search index. Returns True if sucessful deletion, else False
def delete_es_index(index_name):
    es_client = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])
    try: 
        es_client.options(ignore_status=[400,404]).indices.delete(index=index_name)
        return True
    except:
        try:
            es_client.indices.delete(index=index_name, ignore=[400, 404]) 
            return True
        except:
            return False

# returns string of serialized tuple
def tuple_serializer(tuple_t, target_att=None):     
    arr = [(col.replace('\r\n', ' ').replace('\n',  ' '), str(tuple_t[col]).replace('\r\n', ' ').replace('\n',  ' ')) for col in tuple_t.index]
    serialization = (' ; ').join([ f'{pair[0]} : {pair[1]}' for pair in arr])
    if target_att is not None:
        serialization = f'{serialization} ; {target_att} : '
    serialized_tuple = f'[ {serialization} ]'
    return serialized_tuple

# Aggregates all tables in datalake into 1 table
def aggregate_database_table(datalake_path):
    '''Takes a path to the datalake tables and aggregates the serialized tuples 
    of the data into one pandas dataframe'''
    file_list = os.listdir(datalake_path)
    
    tables = {
        'serialization': [], 
        'table': [],
        'index': [],
    }
    for file in sorted(file_list):
        if file.endswith('.csv'):
            file_path = os.path.join(datalake_path, file)
            try:
                df = pd.read_csv(file_path)
            except Exception as e:
                print(e)
                print(file)
            
            for index in range(len(df)):
                row = df.iloc[index]
                serialized_tuple = tuple_serializer(row)

                tables['serialization'].append(serialized_tuple)
                tables['table'].append(file)
                tables['index'].append(index)
    aggregated_tables = pd.DataFrame(tables)
    return aggregated_tables

# Helper Function 
def encode_data(dataset, encoder, tokenizer, device):
    ds_with_embeddings = dataset.map(lambda example: {
                                     'embeddings':encoder(
                                         **tokenizer(example['serialization'], return_tensors='pt', truncation= True).to(device)
                                     )[0][0].detach().cpu().numpy()
    })
    return ds_with_embeddings

# Function
### Create Index
def create_index(datalake_path, # Path to <FOLDER> containing all csv files
                 serialized_data_path, 
                 index_dir, 
                 index_name, 
                 encoder = None,
                 tokenizer = None,
                 index_type = 'ES'
                 ):

    # Load encoder & tokenizer if none provided
    if encoder == None:
        encoder = DPRContextEncoder.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base').to(device)
    if tokenizer == None:
        tokenizer = DPRContextEncoderTokenizer.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base', truncation = True, max_length = 512)
    

    # Aggregate all tables in datalake
    if os.path.isfile(serialized_data_path):
        df = pd.read_csv(serialized_data_path)
    else: 
        df = aggregate_database_table(datalake_path)
        df = df.sort_values(by='serialization', key=lambda x: x.str.len())
        # Save aggregated table on disk
        df.to_csv(serialized_data_path, index=False)

    # Load aggregated table as huggingface dataset object (Arrow DF)
    dataset = Dataset.from_pandas(df)

    # FAISS Branch
    if index_type == 'FAISS':
        if os.path.exists("./faiss_index/{}".format(index_name)):
            return True
        else:
            # Create embeddings for each tuple in aggregated table
            ds_with_embeddings = encode_data(dataset, encoder, tokenizer, device)
            ds_with_embeddings.add_faiss_index(column='embeddings')
            # Save FAISS Index to disk using index_write_path
            index_write_path = os.path.join(index_dir, index_name)
            ds_with_embeddings.save_faiss_index('embeddings', index_write_path)
    
    # Elastic Search Branch
    elif index_type == 'ES':
        # This client needs to be running on localhost (check markdown cell below for instructions)
        es_client = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])
        if es_client.indices.exists(index=index_name):
            return True
            # try:
            #     es_client.options(ignore_status=[400,404]).indices.delete(index=index_name)
            # except:
            #     es_client.indices.delete(index=index_name, ignore=[400, 404])
        else:
            dataset.add_elasticsearch_index(column='serialization', es_client=es_client, es_index_name=index_name)
    else:
        print('Not a valid index type provided')
  
    return True


#### MAIN FUNCTION
def main_create_index(datalake_path, index_name="es_index_1", chosen_index_type = "ES",index_dir = "./faiss_index/"):
    ### Make Relevant Folders
    if not os.path.exists("./tmp"):
        os.makedirs("./tmp")
        
    if not os.path.exists("./faiss_index"):
        os.makedirs("./faiss_index")
        
    ### Load Tokenizer and Encoder
    encoder_name, tokenizer_name = 'facebook/dpr-ctx_encoder-single-nq-base', 'facebook/dpr-ctx_encoder-single-nq-base'
    tokenizer_t, encoder_t  = load_tokenizer_encoder(tokenizer_name, encoder_name)

    ### Set Parameters for Index Creation

    serialized_data_path = "./tmp/aggregation_{}.csv".format(index_name) # path + filename to save aggregated datalake table
    # ES: must be provided
    # FAISS: must be provided

    # index_name = "es_index_1" # MUST BE: "es_index_1" for ES , "faiss_index_1" for FAISS
    # ES: must be provided
    # FAISS: must be provided

    # chosen_index_type = "ES" # "ES" or "FAISS" 
    # Default set to 'ES'

    ### Check for and create necessary folders
    # Check datalake path exists else raise error
    if not os.path.exists(datalake_path): raise ValueError('Datalake path does not exist')

    ### Call Create Index Function
    create_index(datalake_path, 
                serialized_data_path, 
                index_dir, 
                index_name, 
                encoder = encoder_t,
                tokenizer = tokenizer_t,
                index_type = chosen_index_type
                )
    return 
