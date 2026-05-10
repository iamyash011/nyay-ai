"""LLM client factory."""
from django.conf import settings

from .base import BaseLLMClient

_client: BaseLLMClient | None = None

def get_llm_client() -> BaseLLMClient:
    """Return the configured LLM client instance (lazy singleton)."""
    global _client
    if _client is None:
        from .openai_client import OpenAIClient
        from .gemini_client import GeminiClient
        from .groq_client import GroqClient
        
        provider = getattr(settings, "LLM_PROVIDER", "openai").lower()
        if provider == "gemini":
            _client = GeminiClient()
        elif provider == "groq":
            _client = GroqClient()
        else:
            _client = OpenAIClient()
    return _client
