import pandas as pd
from typing import List
from fastapi import UploadFile
from qdrant_client import models
from elasticsearch import helpers
from core import es_client, qdrant_client, sentence_model


async def get_indices() -> dict:
    index_names = []
    try:
        es_indices_response = es_client.cat.indices(format="json")
        index_names.extend(
            [
                index["index"]
                for index in es_indices_response
                if not index["index"].startswith(".")
            ]
        )
        qdrant_indices_response = qdrant_client.get_collections()
        index_names.extend(
            [collection.name for collection in qdrant_indices_response.collections]
        )
    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {
        "status": "success",
        "message": "retrieved indices",
        "indices": list(index_names),
    }


async def create_index(index_name: str, csv_files: List[UploadFile]) -> dict:
    if es_client.indices.exists(index=index_name) or qdrant_client.collection_exists(
        collection_name=index_name
    ):
        return {"status": "fail", "message": "index already exists"}

    es_client.indices_client.create(
        index=index_name,
        body={
            "settings": {"number_of_shards": 1, "number_of_replicas": 0},
            "mappings": {
                "properties_client": {
                    "content": {"type": "text"},
                    "source": {"type": "text"},
                }
            },
        },
    )

    qdrant_client.recreate_collection(
        collection_name=index_name,
        vectors_config=models.VectorParams(
            size=sentence_model.get_sentence_embedding_dimension(),
            distance=models.Distance.COSINE,
        ),
    )

    vectors = []
    payloads = []
    for csv_file in csv_files:
        df = pd.read_csv(csv_file.file)
        data = []
        embeddings = []
        for _, row in df.iterrows():
            row_str = row.to_json()
            embedding = sentence_model.encode(row_str).tolist()
            data.append({"content": row_str, "source": csv_file.filename})
            embeddings.append(embedding)

        vectors.extend(embeddings)
        payloads.extend(data)

    actions = [{"_index": index_name, "_source": doc} for doc in payloads]
    helpers.bulk(es_client, actions)

    points = [
        models.PointStruct(id=i, vector=embedding, payload=payload)
        for i, (embedding, payload) in enumerate(zip(embeddings, payloads))
    ]
    qdrant_client.upsert(collection_name=index_name, points=points)

    return {"status": "success", "message": "datalake indexed"}


async def update_index(index_name: str, csv_files: List[UploadFile]) -> dict:
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "messsage": "index does not exist"}

    vectors = []
    payloads = []
    for csv_file in csv_files:
        df = pd.read_csv(csv_file.file)
        data = []
        embeddings = []
        for _, row in df.iterrows():
            row_str = row.to_json()
            embedding = sentence_model.encode(row_str).tolist()
            data.append({"content": row_str, "source": csv_file.filename})
            embeddings.append(embedding)

        vectors.extend(embeddings)
        payloads.extend(data)

    curr_i = qdrant_client.get_collection(index_name).payload_count

    actions = [{"_index": index_name, "_source": doc} for doc in payloads]
    helpers.bulk(es_client, actions)

    points = [
        models.PointStruct(id=curr_i + i, vector=embedding, payload=payload)
        for i, (embedding, payload) in enumerate(zip(embeddings, payloads))
    ]
    qdrant_client.upsert(collection_name=index_name, points=points)

    return {"status": "success", "message": "datalake index updated"}


async def delete_index(index_name: str) -> dict:
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "message": "index does not exist"}

    es_client.indices.delete(index=index_name)
    qdrant_client.delete_collection(collection_name=index_name)

    return {"status": "success", "message": "index removed"}
