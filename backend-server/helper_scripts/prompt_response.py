print("LOADING helper_script: PROMPT_RESPONSE")
import os
import time
import warnings
import numpy as np
import pandas as pd
import pyspark
import synapse.ml
from py4j.java_gateway import java_import
from pyspark.sql import SparkSession
from pyspark.sql.functions import col
from synapse.ml.cognitive import OpenAICompletion
from synapse.ml.core.platform import find_secret, running_on_synapse

from helper_scripts.post_processing import response_mapping_to_fixed_cats, answer_extraction_from_response

def create_spark_session():
    spark = pyspark.sql.SparkSession.builder.appName("MyApp") \
            .config("spark.jars.packages", "com.microsoft.azure:synapseml_2.12:0.10.1") \
            .config("spark.jars.repositories", "https://mmlspark.azureedge.net/maven") \
            .getOrCreate()

    java_import(spark._sc._jvm, "org.apache.spark.sql.api.python.*")

    return spark

def prompt_response_gpt3(list_of_prompts, k, use_fixed_cats, impute_col_name = None, given_fixed_cats = None, spark_session = None):
    
    if use_fixed_cats and given_fixed_cats == None:
        raise Exception("use_fixed_cats is True and no fixed_categories given")

    if spark_session == None:
        spark_session = create_spark_session()

    ### GPT3 Server Params
    service_name = "dataprepopenai"
    deployment_name = "gpt3_davinci_imputer"
    key = "c4abc69022d84e04aacdda594b3ba273"  # please replace this with your key as a string

    
    # list_of_prompts_only_null = [x for x in list_of_prompts if x != None] # Keep only the prompts (In this case None correspond to rows that DO NOT have missing values, hence no need for imputation)
    list_of_prompts_spark_df_format = [(x,) for x in list_of_prompts] # Make prompts into list of tuples for spark df format
    df = spark_session.createDataFrame(list_of_prompts_spark_df_format).toDF("prompt") # Create spark df from list
    
    
    ### When use_fixed_cats is True:
        ### CASE 1: k==1 & use_fixed_cats = True --> return 1 response from the fixed categories list
            # In this we generate 1 response from GPT3 and match it to the top category 
        ### Case 2: k > 1 & use_fixed_cols = True --> returns 2D list [list of size num_rows that contains lists of size k]

        ### 2 possible approaches for this:
            # a) generate k responses from GPT-3 and map each response to one (top 1) category -> can result in dup imputation suggestions
            # b) generate 1 response from GPT-3 and map to k cateogies (top k) 
        # We do approach (b)

    if use_fixed_cats:
        start_time = time.time()

        if k > len(given_fixed_cats):
            warnings.warn("k greater than number of fixed categories. Making k = number_of_fixed_categories")
            k_used = len(given_fixed_cats)
        else:
            k_used = k
            
        completion = (
                        OpenAICompletion() \
                        .setSubscriptionKey(key) \
                        .setDeploymentName(deployment_name) \
                        .setUrl("https://{}.openai.azure.com/".format(service_name)) \
                        .setMaxTokens(48) \
                        .setTemperature(0.80) \
                        .setPresencePenalty(0.75) \
                        .setFrequencyPenalty(0.5) \
                        .setPromptCol("prompt") \
                        .setErrorCol("error") \
                        .setOutputCol("completions") \
                        .setEcho(False) \
                        .setN(1)
                    )

        completed_df = completion.transform(df).cache()
        completed_df_pandas = completed_df.toPandas()
        response_column = completed_df_pandas.completions.tolist() # This has the responses for only the missing value rows, has Spark.Row objects
        clean_respnse_column =  [] # Extracts the text response from Spark.Row objects and stores them here

        ### Go over each row value (which contains 1 text responses to the prompt) and store them in a 2D list named clean_response_column
        for row_index in range(len(response_column)):
            row_response = [response_column[row_index]["choices"][0]["text"].strip()]
            clean_respnse_column.append(row_response)

        print("TIME TAKEN FOR RESPONSES CALL TO GPT3 is {} seconds".format(time.time() - start_time))

        if len(clean_respnse_column) != len(list_of_prompts_spark_df_format):
            warnings.warn("Lengths of Null Cells and Imputation Repairs does not match.")
        
        start_time = time.time()
        mapped_response_column = response_mapping_to_fixed_cats(clean_respnse_column, given_fixed_cats, given_k=k_used) # This has the mapped imputations for only the missing value rows
        print("TIME TAKEN FOR Mapping to Fixed Cats {} seconds".format(time.time() - start_time))

        if len(clean_respnse_column) != len(mapped_response_column):
            warnings.warn("Lengths of Responses List and Mapped Imputations does not match")

        # final_response_list = [] # This will contain "" for values that were NOT missing and the imputations for the missing value rows
        # counter = 0
        # for i in range(len(list_of_prompts)):
        #     if list_of_prompts[i] == None:
        #         final_response_list.append("")
        #     else:
        #         final_response_list.append(mapped_response_column[counter])
        #         counter += 1
        
        # if len(final_response_list) != len(list_of_prompts):
        #     warnings.warn("Lengths of Final Repaired Column and Original Column does not match.")
        
        return mapped_response_column, k_used

    ### When use_fixed_cats = False
    ### Case 3: k >= 1 & use_fixed_cols = False --> returns 2D list [list of size num_rows that contains lists each of size k]
    ### In this we get k responses from the model for each row
    elif k >= 1 and use_fixed_cats == False:
        
        if k > 4: # ensure k is not too large. 4 is chosen arbitrarily and can be changed
            warnings.warn("k should not be greater than 4. Having a larger value of k can exponentually increase GPT-3 costs")
            k_used = 4
        else:    
            k_used = k
            
        completion = (
                        OpenAICompletion() \
                        .setSubscriptionKey(key) \
                        .setDeploymentName(deployment_name) \
                        .setUrl("https://{}.openai.azure.com/".format(service_name)) \
                        .setMaxTokens(48) \
                        .setTemperature(0.80) \
                        .setPresencePenalty(0.75) \
                        .setFrequencyPenalty(0.5) \
                        .setPromptCol("prompt") \
                        .setErrorCol("error") \
                        .setOutputCol("completions") \
                        .setEcho(False) \
                        .setN(k_used)
                    )

        completed_df = completion.transform(df).cache()
        completed_df_pandas = completed_df.toPandas()
        response_column = completed_df_pandas.completions.tolist() # This has the responses for only the missing value rows
        clean_respnse_column =  [] # Extract the text response from Spark.Row objects and stores them here

        ### Go over each row value (which contains k text responses to the prompt) and store them in a 2D list named clean_response_column
        for row_index in range(len(response_column)):
            row_response = []
            for kth_val in range(k_used):
                row_response.append( response_column[row_index]["choices"][kth_val]["text"].strip() )
            clean_respnse_column.append(row_response)
        
        if len(clean_respnse_column) != len(list_of_prompts_spark_df_format):
            warnings.warn("Lengths of Prompts and Imputation Repairs does not match.")

        print("FIRST 10 RESPONSES FROM GPT (BEFORE EXTACTION):")
        print(clean_respnse_column[:10])
        # print(clean_respnse_column[])

        start_time = time.time()
        extracted_answers_list = answer_extraction_from_response(clean_respnse_column, impute_col_name, given_k=k_used)


        print("FIRST 10 EXTRACTED ANSWERS FROM GPT (AFTER ROBERTA EXTRACTION):")
        print(extracted_answers_list[:10])
        # print(extracted_answers_list[-1])

        if len(clean_respnse_column) != len(extracted_answers_list):
            warnings.warn("Lengths of Responses and Extracted Answers does not match.")

        # final_response_list = [] # This will contain "" for values that were NOT missing and the imputations for the missing value rows
        # counter = 0
        # for i in range(len(list_of_prompts)):
        #     if list_of_prompts[i] == None:
        #         final_response_list.append(None)
        #     else:
        #         final_response_list.append(clean_respnse_column[counter])
        #         counter += 1
        
        # if len(final_response_list) != len(list_of_prompts):
        #     warnings.warn("Lengths of Final Repaired Column and Original Column does not match.")
        
        return extracted_answers_list, k_used
            
            
        


