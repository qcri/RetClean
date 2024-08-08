import pandas as pd
from fastapi import UploadFile
from qdrant_client import models
from elasticsearch import helpers
from core import es_client, qdrant_client, sentence_model


async def get_indexes() -> dict:
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

    return {"status": "success", "indexes": index_names}


async def create_index(index_name: str, csv_files: list[UploadFile]) -> dict:
    if es_client.indices.exists(index=index_name) or qdrant_client.collection_exists(
        collection_name=index_name
    ):
        return {"status": "fail", "message": "index already exists"}

    try:
        es_client.indices_client.create(
            index=index_name,
            body={
                "mappings": {
                    "properties": {
                        "source": {"type": "text"},
                        "table": {"type": "text"},
                        "row": {"type": "integer"},
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
            for i, row in df.iterrows():
                row_str = row.to_json()
                embedding = sentence_model.encode(row_str).tolist()
                vectors.append(embedding)
                payloads.append(
                    {"source": row_str, "table": csv_file.filename, "row": i}
                )

        actions = [
            {"_op_type": "index", "_index": index_name, "_source": doc}
            for doc in payloads
        ]
        helpers.bulk(es_client, actions)

        points = [
            models.PointStruct(id=i, vector=embedding, payload=payload)
            for i, (embedding, payload) in enumerate(zip(vectors, payloads))
        ]
        qdrant_client.upsert(collection_name=index_name, points=points)

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success"}


async def update_index(index_name: str, csv_files: list[UploadFile]) -> dict:
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "messsage": "index does not exist"}

    try:
        vectors = []
        payloads = []
        for csv_file in csv_files:
            df = pd.read_csv(csv_file.file)
            for i, row in df.iterrows():
                row_str = row.to_json()
                embedding = sentence_model.encode(row_str).tolist()
                vectors.append(embedding)
                payloads.append(
                    {"source": row_str, "table": csv_file.filename, "row": i}
                )

        actions = [
            {"_op_type": "index", "_index": index_name, "_source": doc}
            for doc in payloads
        ]
        helpers.bulk(es_client, actions)

        curr_i = qdrant_client.get_collection(index_name).payload_count

        points = [
            models.PointStruct(id=curr_i + i, vector=embedding, payload=payload)
            for i, (embedding, payload) in enumerate(zip(vectors, payloads))
        ]
        qdrant_client.upsert(collection_name=index_name, points=points)

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success"}


async def delete_index(index_name: str) -> dict:
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "message": "index does not exist"}

    try:
        es_client.indices.delete(index=index_name)
        qdrant_client.delete_collection(collection_name=index_name)

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success"}
