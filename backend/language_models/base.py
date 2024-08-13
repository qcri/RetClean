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
    def generate(self, text: str) -> str:
        pass

    def extract_value_citation(self, model_response: str) -> str:
        # Parse model output and return

        # Method 1: Expected JSON format, no noise
        try:
            response_dict = eval(model_response)
            value = response_dict["value"]
            table_name = response_dict["table_name"] if response_dict["table_name"] != '' else None
            row_number = response_dict["row_number"] if response_dict["row_number"] != '' else None
            return {
                "value": value,
                "table_name": table_name,
                "row_number": row_number
            }

        except:
            pass

        # Method 2: Expected JSON format, with noise around
        try:
            # Extract the dictionary part of a string from within a larger string
            start = model_response.find("{")
            end = model_response.rfind("}") + 1
            response_dict = eval(model_response[start:end])
            value = response_dict["value"]
            table_name = response_dict["table_name"] if response_dict["table_name"] != '' else None
            row_number = response_dict["row_number"] if response_dict["row_number"] != '' else None
            return {
                "value": value,
                "table_name": table_name,
                "row_number": row_number
            }
        except:
            pass

        # Method 3: Broken JSON format, with/without noise around
        try:
            # Get value
            try:
                # find the term "value : " in the response and extract everything after that till the next white space
                value_start = model_response.find("value : ") + len("value : ")
                value_end = model_response.find(" ", value_start)
                value = model_response[value_start:value_end]
                value = value if value != '' else None

            except:
                value = None

            # Get citation
            try:
                # find the term "table_name : " in the response and extract everything after that till the next white space
                table_name_start = model_response.find("table_name : ") + len("table_name : ")
                table_name_end = model_response.find(" ", table_name_start)
                table_name = model_response[table_name_start:table_name_end]
                table_name = table_name if table_name != '' else None

                # find the term "row_number : " in the response and extract everything after that till the next white space
                row_number_start = model_response.find("row_number : ") + len("row_number : ")
                row_number_end = model_response.find(" ", row_number_start)
                row_number = model_response[row_number_start:row_number_end]
                row_number = row_number if row_number != '' else None

            except:
                table_name, row_number = None, None

            return {"value": value, "table_name": table_name, "row_number": row_number}

        except:
            pass

        # If all above fails
        return {"value": None, "table_name": None, "row_number": None}
