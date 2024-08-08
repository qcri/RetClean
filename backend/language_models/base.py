from abc import ABC, abstractmethod


class LanguageModel(ABC):

    def __init__(self, type: str):
        if type not in ["local", "cloud"]:
            raise ValueError("type must be either 'local' or 'cloud'")
        self.type = type

    @abstractmethod
    def prompt_wrapper(self, text: str) -> str:
        pass

    @abstractmethod
    def generate(self, text: str) -> str:
        pass
