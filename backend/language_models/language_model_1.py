from .base import LanguageModel


class LanguageModel1(LanguageModel):

    def __init__(self):
        super().__init__(type="local")
        self.model = "language_model_1"

    def prompt_wrapper(self, text: str) -> str:
        # Example wrapper that modifies the input text
        return f"LanguageModel1 prompt: {text}"

    def generate(self, text: str) -> str:
        # Placeholder function for generating text using the model
        return f"{self.model} generated: {text}"
