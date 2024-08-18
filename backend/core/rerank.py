from reranking import RERANKER_MAP

async def rerank_data(
    reranker_type: str,
    target_name: list[dict],
    pivot_names: list[str],
    pivot_data: list[dict],
    retrieved_list: list[dict]
) -> dict:
    
    try:
        # Load reranker
        ranker = RERANKER_MAP[reranker_type]
        
        # Make target tuple string
        target_tuple_strings = []
        for i in range(len(pivot_data)):
            target_tuple_string = ""
            for j in range(len(pivot_names)):
                target_tuple_string +=  pivot_names[j] + ":" + pivot_data[i]["values"][j] + ","
            target_tuple_string += target_name
            target_tuple_string = target_tuple_string.lower().strip()
            target_tuple_strings.append(target_tuple_string)

        # Make retrieved tuples strings
        retrieved_tuples_strings = []
        for retrieved_tuple_set in retrieved_list:
            retrieved_tuple_string_set = []
            retrieved_tuple_string = ""
            for retrieved_tuple in retrieved_tuple_set:
                retrieved_tuple_string = retrieved_tuple["values"].replace("{","").replace("}","").lower().strip()
                retrieved_tuple_string_set["values"] = retrieved_tuple_string
                retrieved_tuple_string_set["table_name"] = retrieved_tuple["table_name"]
                retrieved_tuple_string_set["row_number"] = retrieved_tuple["row_number"]
            retrieved_tuples_strings.append(retrieved_tuple_string_set)

        # Rerank
        new_reranked_list = []
        for x in range(len(target_tuple_strings)):
            reranked_results = ranker.rank(query=target_tuple_strings[x], docs=retrieved_tuples_strings[x], doc_ids=list(range(len(retrieved_tuples_strings[x]))), metadata = [{"table_name" : retrieved_tuples_strings[x][i]["table_name"], "row_number" : retrieved_tuples_strings[x][i]["row_number"]} for i in range(len(retrieved_tuples_strings[x]))])
            new_reranked_list.append([{"values":reranked_results[i].document.text, "table_name":reranked_results[i].metadata["table_name"], "row_number":reranked_results[i].metadata["row_number"]} for i in range(len(reranked_results.results))])

        return {"status": "pass", "results": new_reranked_list}

    except Exception as e:
        print("Reranking failed", e)
        return {"status": "pass", "results": retrieved_list}





