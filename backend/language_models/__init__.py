from .language_model_gpt4 import GPT4Repairer
from .language_model_llama3 import Llama_3_1

# Map model names to their respective classes
MODEL_MAP = {"GPT-4": GPT4Repairer, "Llama 3.1": Llama_3_1}
