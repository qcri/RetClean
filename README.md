# RetClean

This is the official repository for the RetClean data repair project under the QCRI organization. RetClean is a tool that leverages language models for data cleaning operations, such as missing value imputation imputation. The paper detailing the project can be found on arxiv at this [https://arxiv.org/abs/2303.16909](link)

## Installation and Use

You must have node, npm, python, and pipenv installed on your machine. After downloading the repo, in the root diretory of the project run -

```
./install.sh
```

After all the necessary modules are downloaded, launch the local application with -

```
./start.sh
```

The server will run on port 9690 and the client will run on port 3000. View the client at url: [http://localhost:3000/](http://localhost:3000/)

## Potential Errors and Fixes:

1. Ensure elasticsearch server is up and running.
2. Formatting of finetuning_set is correct if given.
3. Ensure .env file exists in correct format.

## To Add:

1. Return "No Value Found" instead of empty string.
