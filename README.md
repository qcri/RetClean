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
  2). Unzip the tar file into chosen directory by double clicking or using the following command on the temrinal:
  ```
  tar -xvzf elasticsearch-7.17.6-darwin-x86_64.tar.gz
  ```
  3). Go into directory where ES is unzipped using ```cd elasticsearch-7.17.6```and run command:```./bin/elasticsearch``` on the terminal. This will start an ES server on the localhost on port 9200 (default port). RetClean expects the ES server to be on port 9200.   



## Potential Errors and Fixes:

1. Ensure elasticsearch server is up and running.
2. Formatting of finetuning_set is correct if given.
3. Ensure .env file exists in correct format.

## To Add:

1. Return "No Value Found" instead of empty string.
