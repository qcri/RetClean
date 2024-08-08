import os
import openai
from dotenv import load_dotenv

from .base import LanguageModel

class GPT4Repairer(LanguageModel):

    def __init__(self):
        super().__init__(type="cloud")

    def initialize_model(self):
        # Load environment variables from the .env file
        load_dotenv()
        self.model = "GPT4"
        # Retrieve the variables
        self.api_key = os.getenv("GPT4_API_KEY")
        self.endpoint = os.getenv("GPT4_ENDPOINT")
        self.api_version = os.getenv("GPT4_API_VERSION")
        self.deployment_id = os.getenv("GPT4_DEPLOYMENT_ID")

        openai.api_key = self.api_key
        openai.api_base = self.endpoint
        openai.api_type = "azure"
        openai.api_version = self.api_version

    def prompt_wrapper(self, text: str) -> str:
        # Example wrapper that modifies the input text
        return text

    def generate(self, text: str) -> str:
        # Placeholder function for generating text using the model
        response = openai.ChatCompletion.create(
            engine="gpt4_imputer", # The deployment name you chose when you deployed the GPT-3.5-Turbo or GPT-4 model.
            messages=[
                {"role": "system", "content": "You are a data expert. Your role is to provide the value of the missing attribute for the given entity. If a context is given which contains other related entities, you must use those to determine the missing attribute value for the target entity. If a context is not provided, you must use your own knowledge to determine the value for the missing attribute. Please return on the value of the missing attribute as your response. Do not return any additional text or explanation. Return only the value of the missing attribute as your response."},
                {"role": "user", "content": text}
            ],
            stop=None,
            temperature=0.001
            )
        return response.choices[0]["message"]["content"]
