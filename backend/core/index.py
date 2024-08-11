import time
import pandas as pd
from fastapi import UploadFile
from qdrant_client import models
from elasticsearch import helpers
from core import es_client, qdrant_client, sentence_model


async def get_indexes() -> dict:
    es_index_names = []
    qdrant_index_names = []
    try:
        es_indices_response = es_client.cat.indices(format="json")
        es_index_names.extend(
            [
                index["index"]
                for index in es_indices_response
                if not index["index"].startswith(".")
            ]
        )
        qdrant_indices_response = qdrant_client.get_collections()
        qdrant_index_names.extend(
            [collection.name for collection in qdrant_indices_response.collections]
        )

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    index_names = list(set(es_index_names) & set(qdrant_index_names))
    return {"status": "success", "indexes": index_names}


async def create_index(index_name: str) -> dict:
    if es_client.indices.exists(index=index_name) or qdrant_client.collection_exists(
        collection_name=index_name
    ):
        return {"status": "fail", "message": "index already exists"}

    try:
        es_client.create(
            id=index_name,
            index=index_name,
            body={
                "mappings": {
                    "properties": {
                        "values": {"type": "text"},
                        "table_name": {"type": "text"},
                        "row_number": {"type": "integer"},
                    }
                },
            },
        )
        print("created es index")

        qdrant_client.recreate_collection(
            collection_name=index_name,
            vectors_config=models.VectorParams(
                size=sentence_model.get_sentence_embedding_dimension(),
                distance=models.Distance.COSINE,
            ),
        )
        print("created qdrant collection")

    except Exception as e:
        return {"status": "fail", "message": str(e)}

    return {"status": "success"}


async def update_index(index_name: str, files: list[UploadFile]) -> dict:
    if not (
        es_client.indices.exists(index=index_name)
        and qdrant_client.collection_exists(collection_name=index_name)
    ):
        return {"status": "fail", "message": "index does not exist"}

    try:
        points = []
        actions = []
        current_time = int(time.time() * 1e3)  # Get the timestamp once

        for csv_file in files:
            df = pd.read_csv(csv_file.file)
            row_jsons = df.apply(lambda row: row.to_json(), axis=1)

            embeddings = [
                sentence_model.encode(row_str).tolist() for row_str in row_jsons
            ]

            points.extend(
                models.PointStruct(
                    id=current_time + i,  # Use incremental IDs to avoid collisions
                    vector=embedding,
                    payload={
                        "values": row_json,
                        "table_name": csv_file.filename,
                        "row_number": i,
                    },
                )
                for i, (row_json, embedding) in enumerate(zip(row_jsons, embeddings))
            )

            actions.extend(
                {
                    "_op_type": "index",
                    "_index": index_name,
                    "_source": {
                        "values": row_json,
                        "table_name": csv_file.filename,
                        "row_number": i,
                    },
                }
                for i, row_json in enumerate(row_jsons)
            )

        # Perform bulk operations
        helpers.bulk(es_client, actions)
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
