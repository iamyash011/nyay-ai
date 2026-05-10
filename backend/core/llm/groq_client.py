"""Groq API client implementation using OpenAI SDK."""
import json
import logging
import time
from typing import Any

from openai import OpenAI, RateLimitError, APITimeoutError, OpenAIError
from django.conf import settings

from .base import BaseLLMClient

logger = logging.getLogger(__name__)


class GroqClient(BaseLLMClient):
    """Wrapper around the openai library configured for Groq API."""

    def __init__(self):
        self._client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
            timeout=settings.OPENAI_TIMEOUT,
            max_retries=0,
        )
        self.model = settings.GROQ_MODEL
        self.max_retries = settings.OPENAI_MAX_RETRIES

    def chat(
        self,
        messages: list[dict],
        response_format: dict | None = None,
        temperature: float = 0.3,
        max_tokens: int = 2000,
        **kwargs,
    ) -> str:
        last_exc = None
        for attempt in range(self.max_retries):
            try:
                call_kwargs: dict[str, Any] = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                }
                if response_format:
                    call_kwargs["response_format"] = response_format

                response = self._client.chat.completions.create(**call_kwargs)
                content = response.choices[0].message.content
                logger.debug("Groq call succeeded | model=%s | content=%s", self.model, content)
                return content
            except RateLimitError as exc:
                wait = 2 ** attempt
                logger.warning("Groq rate limit — waiting %ss (attempt %s)", wait, attempt + 1)
                time.sleep(wait)
                last_exc = exc
            except APITimeoutError as exc:
                logger.warning("Groq timeout on attempt %s", attempt + 1)
                last_exc = exc
            except OpenAIError as exc:
                # Retry on connection errors or other transient issues
                if attempt < self.max_retries - 1:
                    wait = 2 ** attempt
                    logger.warning("Groq connection error: %s — retrying in %ss", exc, wait)
                    time.sleep(wait)
                    last_exc = exc
                else:
                    logger.error("Groq error after %s attempts: %s", self.max_retries, exc)
                    raise

        raise RuntimeError(f"Groq call failed after {self.max_retries} retries: {last_exc}")

    def chat_json(self, messages: list[dict], **kwargs) -> dict:
        raw = self.chat(
            messages,
            response_format={"type": "json_object"},
            **kwargs,
        )
        try:
            return json.loads(raw)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse JSON from LLM: %s\nRaw: %s", exc, raw[:500])
            raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    def embed(self, text: str) -> list[float]:
        # Groq currently does not support embeddings. We stub it out just in case.
        logger.warning("Groq does not support embeddings natively. Returning empty vector.")
        return [0.0] * 1536
