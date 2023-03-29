import torch
import time
from sentence_transformers import SentenceTransformer, util
from sentence_transformers.cross_encoder import CrossEncoder
from utils import *

device = 'cuda' if torch.cuda.is_available() else 'cpu'

model = SentenceTransformer('all-MiniLM-L6-v2', device=device)
model2 = CrossEncoder('sentence-transformers/all-MiniLM-L6-v2', device=device)

def load_encoder_reranker(mode="colbert"):
    if mode == "colbert":
        return SentenceTransformer('all-MiniLM-L6-v2', device=device)
    elif mode == "crossencoder":
        return CrossEncoder('sentence-transformers/all-MiniLM-L6-v2', device=device)
    else:
        raise ValueError("Reranker mode not recognized. Use 'colbert' or 'crossencoder'")

# Helpers for ColBERT
def get_pair_chunks(s, encoder):
    pair_list = s[2:-2].split(' ; ')
    embeddings = encoder.encode(pair_list, convert_to_tensor=True)
    return embeddings

def max_sim_pair(embeddings1, embeddings2):
    cosine_scores = util.cos_sim(embeddings1, embeddings2)
    input_max, max_indices = torch.max(cosine_scores, 1)
    res = torch.mean(input_max)
    return res.item()

### ColBERT Main Function
def colbert_like_rerank(query, retrieved_set_dict, encoder):
    retrieved_set_table_index_vals = {}
    retrieved_set = retrieved_set_dict["serialization"]

    for i in range(len(retrieved_set)):
        retrieved_set_table_index_vals[retrieved_set[i]] = [retrieved_set_dict["table"][i], retrieved_set_dict["index"][i]]

    q_encoded = get_pair_chunks(query, encoder)

    res = []
    for retrieved in retrieved_set:
        r_encoded = get_pair_chunks(retrieved, encoder)
        score = max_sim_pair(q_encoded, r_encoded)
    
        res.append({
            'retrieved': retrieved,
            'score': score
        })
        
    res = sorted(res, key=lambda x: x['score'], reverse=True)
    tuples, _ = zip(*[elem.values() for elem in res])
    
    ret_ranked = {
        "serialization" : tuples,
        "table" : [retrieved_set_table_index_vals[x][0] for x in tuples],
        "index" : [retrieved_set_table_index_vals[x][1] for x in tuples]
    }
    return ret_ranked

### Cross Encoder Main Function
def cross_encoder_based_rerank(query, retrieved_set_dict, encoder):
    retrieved_set_table_index_vals = {}
    retrieved_set = retrieved_set_dict["serialization"]

    for i in range(len(retrieved_set)):
        retrieved_set_table_index_vals[retrieved_set[i]] = [retrieved_set_dict["table"][i], retrieved_set_dict["index"][i]]

    scores = encoder.predict([(query, retrieved) for retrieved in retrieved_set])
    res = sorted(zip(retrieved_set, scores), key=lambda x: x[0], reverse=True)
    tuples, scores = zip(*res)

    ret_ranked = {
        "serialization" : tuples,
        "table" : [retrieved_set_table_index_vals[x][0] for x in tuples],
        "index" : [retrieved_set_table_index_vals[x][1] for x in tuples]
    }
    return ret_ranked

print("LOADED reranker_helper")