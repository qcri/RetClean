import os
from dotenv import load_dotenv
from huggingface_hub import login
from vllm import LLM, SamplingParams
from transformers import AutoTokenizer

from .base import LanguageModel


class LanguageModel1(LanguageModel):

    def __init__(self):
        super().__init__(type="local")

        load_dotenv()
        self.model = "llama2"
        # Huggingface login (needed for LLAMA models)
        login(token=os.getenv("HF_LOGIN_TOKEN"))
        self.tokenizer = tokenizer = AutoTokenizer.from_pretrained(
            "meta-llama/Llama-2-7b-chat-hf", trust_remote_code=True
        )
        self.model = LLM(
            model="meta-llama/Llama-2-7b-chat-hf", trust_remote_code=True, dtype="half"
        )

    def prompt_wrapper(self, text: str) -> str:
        # Example wrapper that modifies the input text
        return f"LanguageModel1 prompt: {text}"

    def generate(self, text: str) -> str:
        # Placeholder function for generating text using the model
        return f"{self.model} generated: {text}"
