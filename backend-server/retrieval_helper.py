from datasets import Dataset, load_dataset
import os
from elasticsearch import Elasticsearch
from transformers import DPRContextEncoder, DPRContextEncoderTokenizer
import torch
from utils import *

device = 'cuda' if torch.cuda.is_available() else 'cpu'

# Helper Function
def load_index(serialized_data_path, index_dir, index_name, index_type):
    serialized_data = load_dataset('csv', data_files=serialized_data_path)
    if index_type == 'FAISS':
        faiss_index_path = os.path.join(index_dir, index_name)
        print(os.path.join(index_dir, index_name))
        serialized_data['train'].load_faiss_index('embeddings', faiss_index_path)
    elif index_type == 'ES':
        es_client = Elasticsearch([{'host': 'localhost', 'port': 9200, 'scheme': 'http'}])
        serialized_data['train'].load_elasticsearch_index('serialization', es_client=es_client, es_index_name=index_name)
    return serialized_data 

# Main Retrieval Function
def search_index(query_tuple, # str format, serialized
                 serialized_data_path, # path to aggregated datalake table
                 index_dir, 
                 index_name,
                 encoder = None,
                 tokenizer = None,
                 index_type = "FAISS",
                 k = 20, # number of tuples to retrieve
                 ):
###
# returns dictionary of lists: {
#  "serialization" : [serialized_tuple <str>] ,
#  "table" : [parent_table_name <str>] ,
#  "index" : [parent_table_index <int>]
# }
###

    # Load encoder & tokenizer if none provided
    if encoder == None:
        encoder = DPRContextEncoder.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base').to(device)
    if tokenizer == None:
        tokenizer = DPRContextEncoderTokenizer.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base', truncation = True, max_length = 512)
    
    retrieved_examples = False
    
    dataset = load_index(serialized_data_path, index_dir, index_name, index_type)
    # print(type(dataset))
    # print(dataset)
    dataset = dataset["train"]
    if index_type == 'FAISS':
        search_query_embedding = encoder(**tokenizer(query_tuple, return_tensors='pt').to(device))[0][0].detach().cpu().numpy() 
        scores, retrieved_examples = dataset.get_nearest_examples('embeddings', search_query_embedding, k=k)
    elif index_type == 'ES':
        scores, retrieved_examples = dataset.get_nearest_examples('serialization', query_tuple, k=k)
  
    return retrieved_examples 

print("LOADED retrieval_helper")