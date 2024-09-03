from .language_model_gpt4 import GPT4
from .language_model_llama3_1 import Llama3_1

# Map model names to their respective classes
MODEL_MAP = {"GPT-4": GPT4, "Llama 3.1": Llama3_1}
