import os
import anthropic
from dotenv import load_dotenv

from .base import LanguageModel

class GPT4Repairer(LanguageModel):

    def __init__(self):
        super().__init__(type="cloud")

    def initialize_model(self):
        # Load environment variables from the .env file
        load_dotenv()
        self.model = "CLAUDE"
        # Retrieve the variables
        self.api_key = os.getenv("CLAUDE_API_KEY")
        self.client = anthropic.Anthropic(api_key=self.api_key)

    def prompt_wrapper(self, text: str) -> str:
        return text

    def generate(self, text: str) -> str:
        # Placeholder function for generating text using the model
        message = self.client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=100,
            temperature=0,
            system="You are a data expert. Your role is to provide the value of the missing attribute for the given entity. If a context is given which contains other related entities, you must use those to determine the missing attribute value for the target entity. If a context is not provided, you must use your own knowledge to determine the value for the missing attribute. Please return on the value of the missing attribute as your response. Do not return any additional text or explanation. Return only the value of the missing attribute as your response.",
            messages=[
                # First Message from user
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": text
                        }
                    ]
                }
            ]
        )
        return message.content
