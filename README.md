# RetClean

This is the official repository for the RetClean data repair project under the QCRI organization. RetClean is a tool that leverages language models for data cleaning operations, such as missing value imputation imputation. The paper detailing the project can be found on arxiv at this [link](https://arxiv.org/abs/2303.16909).

## Installation and Use

### RetClean Setup:
You must have node, npm, python, and pipenv installed on your machine. After downloading the repo, in the root diretory of the project run -

```
./install.sh
```
In the *backend-server* directory create a file named ".env" which should have the following format:
```
API_KEY="<your_azure_openai_key>"
SERVICE_NAME="<your_azure_resource_name>"
DEPLOYMENT_NAME="<model_deployment_name>"
```

After all the necessary modules are downloaded and the .env file is created, launch the local application with -

```
./start.sh
```

The server will run on port 9690 and the client will run on port 3000. View the client at url: [http://localhost:3000/](http://localhost:3000/)

### ElasticSearch setup:
RetClean also requires an elasticsearch instance to be running locally. Follow these steps:

  1). Download [ElasticSearch 7.17.6](https://www.elastic.co/guide/en/elasticsearch/reference/7.17/install-elasticsearch.html)   
  2). Unzip the tar file into a chosen directory by double clicking or using the following command on the temrinal:
  ```
  tar -xvzf elasticsearch-7.17.6-darwin-x86_64.tar.gz
  ```
  3). Go into the directory where ES is unzipped using ```cd elasticsearch-7.17.6```and run command:```./bin/elasticsearch``` on the terminal. This will start an ES server on the localhost on port 9200 (default port). RetClean expects the ES server to be on port 9200.   

## Recommendation:

When using the retrieval module, the indexing of the datalake may take time. However, if you wish to repair multiple tables using the same datalake or simply use a datalake that was previously indexed, input an index name alongside the datalake. After that, the created index can be accessed and used by providing that index name (and no datalake). (Note: if you provide an existing index name and a datalake again, this datalake will be indexed with the provided name, overwriting the previously saved index with the same name). 


