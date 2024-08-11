import ollama
from .base import LanguageModel


class LanguageModel1(LanguageModel):

    def __init__(self):
        super().__init__(type="local")
        self.model = "llama3"
        self.tokenizer = ollama.Tokenizer("llama3.1")

    def prompt_wrapper(self, text: str) -> str:
        # Need to rewrite this function based on what what the inputted text is to this function
        formatted_tokens = self.tokenizer.apply_chat_template(
            text, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        )
        chat_format_prompt = str(self.tokenizer.decode(formatted_tokens[0]))

    def generate(self, text: str) -> str:
        response = ollama.chat(
            model="llama3.1",
            messages=[
                {
                    "role": "user",
                    "content": text,
                },
            ],
        )
        return response["message"]["content"]
