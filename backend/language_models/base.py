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
            return {
                "value": response_dict["value"],
                "table_name": "_".join(response_dict["citation"].split("_")[:-1]),
                "row_number": response_dict["citation"].split("_")[-1],
            }

        except:
            pass

        # Method 2: Expected JSON format, with noise around
        try:
            # Extract the dictionary part of a string from within a larger string
            start = model_response.find("{")
            end = model_response.rfind("}") + 1
            response_dict = eval(model_response[start:end])
            return {
                "value": response_dict["value"],
                "table_name": "_".join(response_dict["citation"].split("_")[:-1]),
                "row_number": response_dict["citation"].split("_")[-1],
            }
        except:
            pass

        # Method 3: Broken JSON format, with/without noise around
        try:
            # Get value
            try:
                # find the term "value : " in the response and extract everything after that till the next white space
                start = model_response.find("value : ") + len("value : ")
                end = model_response.find(" ", start)
                value = model_response[start:end]
            except:
                value = None

            # Get citation
            try:
                # find the term "citation : " in the response and extract everything after that till the next white space
                start = model_response.find("citation : ") + len("citation : ")
                end = model_response.find(" ", start)
                citation = model_response[start:end]
                table_name = "_".join(citation.split("_")[:-1])
                row_number = citation.split("_")[-1]
            except:
                citation, table_name, row_number = None, None, None

            return {"value": value, "table_name": table_name, "row_number": row_number}

        except:
            pass

        # If all above fails
        return {"value": None, "table_name": None, "row_number": None}
