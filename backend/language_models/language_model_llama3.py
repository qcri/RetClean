import ollama
# from transformers import PreTrainedTokenizerFast
from .base import LanguageModel


class Llama_3_1(LanguageModel):

    def __init__(self):
        super().__init__(type="local")
        self.model = "llama3"
        # self.tokenizer = PreTrainedTokenizerFast.from_pretrained(
        #     "language_models/llama31_tokenizer"
        # )

    def prompt_wrapper(self, text: str) -> str:
        # Need to rewrite this function based on what what the inputted text is to this function
        ### There seems to be no need to do this prompt formatting as the ollama.chat api does this for us
        # try:
        #     formatted_tokens = self.tokenizer.apply_chat_template(
        #         text, tokenize=True, add_generation_prompt=True, return_tensors="pt"
        #     )
        #     print("APPLIED CHAT TEMPLATE")
        #     chat_format_prompt = str(self.tokenizer.decode(formatted_tokens[0]))            
        #     print("DECODED PROMPT")
        #     return chat_format_prompt
        # except Exception as e:
        #     print("ERROR IN PROMPT WRAPPER", str(e))
        #     return
        return text

    def generate(self, text: str, retrieved: list) -> str:
        try:
            response = ollama.chat(
                model="llama3.1",
                messages=[
                    {
                        "role": "user",
                        "content": text,
                    },
                ]
            )
            return self.extract_value_citation(response["message"]["content"], retrieved)
        except Exception as e:
            print("ERROR IN GENERATE", str(e))
            return {"status": "fail", "message": str(e)}
