# RetClean

This is the official repository for the RetClean data repair project under QCRI. RetClean is a tool that leverages language models for data cleaning operations, such as imputation and error detection.

## Installation and Use

You must have node and npm installed on your maching. After downloading the repo, simply go to the diretory of the project and run -

```
npm install
```

After all the necessary modules are downloaded, launch the local web client with -

```
npm start
```

Then view the client at url: [http://localhost:3000/](http://localhost:3000/)


## Potential Errors and Fixes:  
1. Ensure elasticsearch server is up and running.     
2. Ensure port running is correct (varies between 5000 & 9690) [backend runs on 9690, frontend sends to 5000].  
3. Formatting of finetuning_set is correct if given.     
4. Ensure .env file exists in correct format.   


## To Add:  
1. Return "No Value Found" instead of empty string.  
