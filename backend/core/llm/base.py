"""Abstract LLM interface — swap OpenAI for Gemini/Anthropic easily."""
import abc
import logging
from typing import Any

logger = logging.getLogger(__name__)


class BaseLLMClient(abc.ABC):
    """All LLM clients must implement this interface."""

    @abc.abstractmethod
    def chat(self, messages: list[dict], response_format: dict | None = None, **kwargs) -> str:
        """Send chat messages and return the text response."""
        ...

    @abc.abstractmethod
    def embed(self, text: str) -> list[float]:
        """Return embedding vector for text."""
        ...
