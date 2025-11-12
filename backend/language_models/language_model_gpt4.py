import os
from openai import AzureOpenAI, OpenAI
from dotenv import load_dotenv

from .base import LanguageModel


class GPT4AzureOpenAI(LanguageModel):

    def __init__(self):
        super().__init__(type="cloud")

        # Load environment variables from the .env file
        load_dotenv()
        self.model = "GPT-4-AzureOpenAI"
        # Retrieve the variables
        self.api_key = os.getenv("AZURE_OPENAI_API_KEY")
        self.endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        self.api_version = os.getenv("AZURE_OPENAI_API_VERSION")
        self.deployment_id = os.getenv("AZURE_OPENAI_DEPLOYMENT")


        self.client = AzureOpenAI(
            api_version=self.api_version,
            azure_endpoint=self.endpoint,
            api_key=self.api_key,
        )

    def prompt_wrapper(self, text: str) -> str:
        # Create the messages object for the GPT-4 model
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
        # print("I AM HERE IN GPT-4 GENERATE")
        # print("TEXT:", text)
        # print("%"*50)
        # print("PROMPT:", self.prompt_wrapper(text))
        try:
            response = self.client.chat.completions.create(
                messages=text,
                model=self.deployment_id,
            )
            print("GOT A RESPONSE:", response)
            return self.extract_value_citation(
                response.choices[0].message.content, retrieved
            )

        except Exception as e:
            print("ERROR IN GENERATE", str(e))
            return {"status": "fail", "message": str(e)}
        

class GPT4OpenAI(LanguageModel):
    def __init__(self):
        super().__init__(type="cloud")

        # --- Load environment variables ---
        load_dotenv()
        self.model = "GPT-4-OpenAI"
        # These correspond exactly to what the OpenAI SDK expects
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.org_id = os.getenv("OPENAI_ORG_ID")  # optional
        self.project_id = os.getenv("OPENAI_PROJECT_ID")  # optional
        self.model = os.getenv("OPENAI_MODEL", "gpt-4o")  # default to GPT-4o

        # Initialize OpenAI native client
        # Base URL should remain default unless you’re using a custom proxy
        self.client = OpenAI(
            api_key=self.api_key,
            organization=self.org_id if self.org_id else None,
            project=self.project_id if self.project_id else None,
        )

    def prompt_wrapper(self, text: str) -> list[dict]:
        """Prepare messages for the model."""
        return [
            {
                "role": "system",
                "content": (
                    "You are a data expert. Your task is to provide the value of the "
                    "missing attribute for the given object. If a context is given "
                    "containing other related objects, use only those to infer the value. "
                    "If no context is provided, determine the most likely value yourself. "
                    "Return your answer strictly in this JSON format: "
                    "{'value': <value>, 'table_name': <'' or source table>, "
                    "'row_number': <'' or row>, 'object_id': <'' or Object N>} "
                    "Do not include any explanations."
                ),
            },
            {"role": "user", "content": text},
        ]

    def generate(self, text: str, retrieved: list) -> str:
        # print("I AM HERE IN GPT-4 (OpenAI) GENERATE")
        # print("TEXT:", text)
        # print("%" * 50)
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=text,
            )
            print("GOT A RESPONSE:", response)
            return self.extract_value_citation(
                response.choices[0].message.content, retrieved
            )

        except Exception as e:
            print("ERROR IN GENERATE", str(e))
            return {"status": "fail", "message": str(e)}
