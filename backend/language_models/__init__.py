from .language_model_gpt4 import GPT4AzureOpenAI, GPT4OpenAI
from .language_model_llama3_1 import Llama3_1

# Map model names to their respective classes
MODEL_MAP = {
    "GPT-4-AzureOpenAI": GPT4AzureOpenAI,
    "GPT-4-OpenAI": GPT4OpenAI,
    "Llama 3.1": Llama3_1
}
