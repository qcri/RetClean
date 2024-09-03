import os
from ollama import Client

from .base import LanguageModel


class Llama3_1(LanguageModel):

    def __init__(self):
        super().__init__(type="local")
        self.model = "llama3.1"
        self.client = Client(host=os.getenv("OLLAMA_URL"))

    def prompt_wrapper(self, text: str) -> str:
        # Create the messages object for the Llama3.1 model
        messages = [
            {
                "role": "system",
                "content": """You are a data expert. Your task is to provide the value of the missing attribute for the given object. 
                If a context is given which contains other related objects, you must only use those to determine the missing attribute value for the target entity. 
                If a context is not provided, you must determine the value for the missing attribute yourself. In such a case, always return the most likely value. 
                Your response should have the following format: {'value' : <the value for the missing attribute> , 'table_name' : <'' if no context is given, else the table_name value of the object from the context you took the value from> , 'row_number' : <'' if no context is given, else the row_number value of the object from the context you took the value from> , 'object_id' : <'' if no context is given, else the Object ID / Number (example: 'Object 1' or 'Object 4' etc) of the object from the context you took the value from> }. 
                Do not return any additional text or explanation.""",
            },
            {"role": "user", "content": text},
        ]
        return messages

    def generate(self, text: str, retrieved: list) -> str:
        try:
            response = self.client.chat(
                model=self.model,
                messages=text,
                keep_alive="10m",
            )
            return self.extract_value_citation(
                response["message"]["content"], retrieved
            )
        except Exception as e:
            print("ERROR IN GENERATE", str(e))
            return {"status": "fail", "message": str(e)}
