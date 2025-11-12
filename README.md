# RetClean

## _Retrieval-Based Data Cleaning Using Foundation Models and Data Lakes_

[![VLDB 2024](https://img.shields.io/badge/VLDB%202024-Paper-blue)](https://www.vldb.org/pvldb/vol17/p4421-eltabakh.pdf)

Welcome to the official repository of **RetClean**, a cutting-edge tool developed by QCRI for data repair tasks that demand world knowledge. RetClean combines the power of large language models (LLMs) with indexed CSV datalakes to clean and repair datasets efficiently.

---

## Features

-   **CSV Upload**: Upload CSV files for cleaning.
-   **LLM-Driven Cleaning**: Perform standalone data repair using LLMs.
-   **Data Lake Support**: Upload and index CSV-based datalakes for contextual cleaning.
-   **Custom Configurations**: Choose indices, reasoner models, and re-ranker settings for tailored cleaning workflows.

---

## Tech Stack

RetClean is built using modern tools and frameworks:

-   **Frontend**: [React](https://react.dev/)
-   **Backend**: [FastAPI](https://fastapi.tiangolo.com/)
-   **LLM Serving**: [Ollama](https://ollama.com/)
-   **Indexing and Search**: [Elasticsearch](https://www.elastic.co/) and [Qdrant](https://qdrant.tech/)
-   **Containerization**: [Docker](https://www.docker.com/)

---

## Getting Started

### Installation

Set up RetClean effortlessly using Docker Compose.

1. Clone this repository and navigate to the project root.
2. Create a environment file (.env) in the root folder with the following format:
```yaml
# === General Settings ===
LOG_LEVEL=INFO
SEARCH_ENABLED=true
USE_RERANKER=false
VECTOR_DB=qdrant
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# === Elasticsearch ===
ES_HOST=http://elasticsearch:9200
ES_USER=
ES_PASSWORD=

# === Qdrant ===
QDRANT_HOST=http://qdrant
QDRANT_PORT=6333

# === Azure OpenAI (use these names) ===
AZURE_OPENAI_API_KEY=<put your info here>
AZURE_OPENAI_ENDPOINT=<put your info here>
AZURE_OPENAI_API_VERSION=2024-12-01-preview
AZURE_OPENAI_DEPLOYMENT=<put your info here>


# === OpenAI (use these names) ===
OPENAI_API_KEY=<put your info here>
OPENAI_ORG_ID=<put your info here>
OPENAI_PROJECT_ID=<put your info here>
OPENAI_MODEL=gpt-4o<put your info here>

# === Ollama (Optional for Local Models) ===
OLLAMA_URL=http://ollama:11434

# === Backend ===
BACKEND_PORT=8000
```

3. Build the application using:

```
docker-compose build
```

    This will install the necessary services as well as the dependencies for the client and server.

##### Note

For the local model example available in the application, we use a quantized LLaMA 3.1 model pulled from Ollama. This may require you to increase the allocated max disk space from the default in Docker.

### Start

To get the application running, just run the following command:

```
docker-compose up
```

The application hosted locally will run on port 3000:
[http://localhost:3000/](http://localhost:3000/)

---

## How to Use

1. **Upload Your Data**

    - Upload your CSV file.
    - Select the target column to repair.
    - Choose optional pivot/context columns.

    ![Before Repair](https://github.com/qcri/RetClean/blob/main/assets/pre_repair.png)

2. **Use a Data Lake for Cleaning**

    - Upload a folder of CSVs to create an indexed datalake.
    - Indices are managed using FAISS and Elasticsearch.

    ![Create Index](https://github.com/qcri/RetClean/blob/main/assets/create_index.png)

3. **Configure and Start Repair**

    - Choose the reasoner model, index, and re-ranker settings.
    - Start a repair job.

    ![Loading Repair](https://github.com/qcri/RetClean/blob/main/assets/loading.png)

4. **Review and Confirm Changes**

    - View the suggested repairs for the target column.
    - Confirm or adjust changes as needed.

    ![After Repair](https://github.com/qcri/RetClean/blob/main/assets/post_repair.png)

---

## Contribution

We welcome contributions! Feel free to submit issues or pull requests. For significant changes, please open a discussion to ensure alignment with project goals.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
