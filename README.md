# RetClean
## _Retrieval-Based Data Cleaning Using Foundation Models and Data Lakes_

[![arXiv](https://img.shields.io/badge/arXiv%20paper-2303.16909-b31b1b.svg)](https://arxiv.org/abs/2303.16909)

This is the official repository for the RetClean data repair project under the QCRI organization. RetClean is a tool that leverages language models and CSV datalakes for data cleaning operations that require world knowledge.

## Features

- Upload CSV data for cleaning
- Clean using LLMs standalone
- Upload datalake of CSVs for indexing
- Select an indexed datalake for additional context for cleaning

## Tech

RetClean makes use of several popular tools and frameworks. The main stack:

- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Ollama](https://ollama.com/)
- [Elasticsearch](https://www.elastic.co/)
- [Qdrant](https://qdrant.tech/)
- [Docker](https://www.docker.com/)

## Getting Started

### Installation

RetClean is relatively easy to install and deploy using Docker. Due to the different services used we use Docker Compose to manage the containers of the application.

In the RetClean root directory, simply run the following command:
```
docker-compose build
```
This will install the necessary services as well as the dependencies for the client and server.
##### Note

For the local model example available in the application we use a quantized llama3.1 model pulled from Ollama. This may require you to increase the allocated max disk space from the default in docker. 

### Start

To get the application running just run the following command:
```
docker-compose up
```
The application hosted locally will run on port 3000: 
[http://localhost:3000/](http://localhost:3000/)

## How to use

DIRECTIONS 

![alt text](https://github.com/qcri/RetClean/blob/main/assets/pre_repair.png)

DIRECTIONS 

![alt text](https://github.com/qcri/RetClean/blob/main/assets/create_index.png)

DIRECTIONS 

![alt text](https://github.com/qcri/RetClean/blob/main/assets/loading.png)

DIRECTIONS 

![alt text](https://github.com/qcri/RetClean/blob/main/assets/post_repair.png)


## Acknowledgments





