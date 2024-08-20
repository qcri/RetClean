from abc import ABC, abstractmethod


class LanguageModel(ABC):

    def __init__(self, type: str):
        if type not in ["local", "cloud"]:
            raise ValueError("type must be either 'local' or 'cloud'")
        self.type = type

    @abstractmethod
    def prompt_wrapper(self, text: str) -> str:
        pass

    @abstractmethod
    def generate(self, text: str, retrieved: list) -> str:
        pass

    def stringified_dict_to_dict(self, s: str) -> dict:
        # Convert a stringified dictionary to a dictionary
        try:
            return eval(s)
        except:
            try:
                s = s.replace("{", "").replace("}", "").replace("'", "").replace('"', "")
                ret = {}
                key_val_pairs = s.split(",")
                for pair in key_val_pairs:
                    split_pair = pair.split(":")
                    key, val = split_pair[0], split_pair[1]
                    ret[key.strip()] = val.strip()
                return ret
            except Exception as e:
                print("ERROR: ", str(e))
                return None
        
    def extract_value_citation(self, model_response: str, retrieved: list) -> str:
        # Parse model output and return

        # Method 1: Expected JSON format, no noise
        try:
            response_dict = {k:str(v) for k,v in eval(model_response).items()}
            value = response_dict["value"] if response_dict["value"].lower().strip() not in ["", "none", "unknown", 'n/a', "':"] else None
            if value != None:
                table_name = response_dict["table_name"] if response_dict["table_name"].lower().strip() not in ["", "none", "unknown", 'n/a'] else None
                row_number = response_dict["row_number"] if str(response_dict["row_number"]).lower().strip() not in ["", "none", "unknown", ' n/a'] else None
                retrived_object = retrieved[int(response_dict["object_id"].split(" ")[-1])]["values"] if response_dict["object_id"] not in ["", "none", "unknown", 'n/a'] else None
                retrived_object = self.stringified_dict_to_dict(retrived_object) if retrived_object != None and type(retrived_object) == str else retrived_object
            else:
                table_name = None
                row_number = None
                retrived_object = None

            return {
                "value": value,
                "table_name": table_name,
                "row_number": row_number,
                "tuple" : retrived_object
            }

        except Exception as e:
            pass

        # Method 2: Expected JSON format, with noise around
        try:
            # Extract the dictionary part of a string from within a larger string
            start = model_response.find("{")
            end = model_response.rfind("}") + 1
            response_dict = eval(model_response[start:end])
            value = response_dict["value"] if response_dict["value"].lower().strip() not in ["", "none", "unknown", 'n/a', "':"] else None
            if value != None:
                table_name = response_dict["table_name"] if response_dict["table_name"].lower().strip() not in ["", "none", "unknown"] else None
                row_number = response_dict["row_number"] if str(response_dict["row_number"]).lower().strip() not in ["", "none", "unknown"] else None
                retrived_object = retrieved[int(response_dict["object_id"].split(" ")[-1])]["values"] if response_dict["object_id"] not in ["", "none", "unknown"] else None
                retrived_object = self.stringified_dict_to_dict(retrived_object) if retrived_object != None and type(retrived_object) == str else retrived_object
            else:
                table_name = None
                row_number = None
                retrived_object = None

            return {
                "value": value,
                "table_name": table_name,
                "row_number": row_number,
                "tuple" : retrived_object
            }
        except Exception as e:
            pass

        # Method 3: Broken JSON format, with/without noise around
        try:
            # Get value
            try:
                # find the term "value : " in the response and extract everything after that till the next white space
                value_start = model_response.find("value : ") + len("value : ")
                value_end = model_response.find(" ", value_start)
                value = model_response[value_start:value_end]
                value = value if value.lower().strip() not in ["", "none", "unknown", "':"] else None

                # Get citation
                try:
                    # find the term "table_name : " in the response and extract everything after that till the next white space
                    table_name_start = model_response.find("table_name : ") + len("table_name : ")
                    table_name_end = model_response.find(" ", table_name_start)
                    table_name = model_response[table_name_start:table_name_end]
                    table_name = table_name if table_name.lower().strip() not in ["", "none", "unknown"] else None
                except:
                    table_name = None

                try:
                    # find the term "row_number : " in the response and extract everything after that till the next white space
                    row_number_start = model_response.find("row_number : ") + len("row_number : ")
                    row_number_end = model_response.find(" ", row_number_start)
                    row_number = model_response[row_number_start:row_number_end]
                    row_number = row_number if row_number.lower().strip() not in ["", "none", "unknown"] else None
                except:
                    row_number = None

                try:
                    # find the term "object_id : " in the response and extract everything after that till the next white space
                    object_id_start = model_response.find("object_id : ") + len("object_id : ")
                    object_id_end = model_response.find(" ", object_id_start)
                    object_id = model_response[object_id_start:object_id_end]
                    retrived_object_index = int(object_id.split(" ")[-1]) if object_id not in ["", "none", "unknown"] else None
                    retrived_object = retrieved[retrived_object_index]["values"] if retrived_object_index != None else None
                except:
                    retrived_object = None

            except:
                value = None
                table_name = None
                row_number = None
                retrived_object = None

            return {"value": value, "table_name": table_name, "row_number": row_number, "tuple" : retrived_object}

        except:
            pass

        # If all above fails
        return {"value": None, "table_name": None, "row_number": None, "tuple" : None}

    