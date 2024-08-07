from .base import LanguageModel


class LanguageModel2(LanguageModel):

    def __init__(self):
        super().__init__(type="cloud")
        self.model = "language_model_2"

    def prompt_wrapper(self, text: str) -> str:
        # Example wrapper that modifies the input text
        return f"LanguageModel2 prompt: {text}"

    def generate(self, text: str) -> str:
        # Placeholder function for generating text using the model
        return f"{self.model} generated: {text}"
