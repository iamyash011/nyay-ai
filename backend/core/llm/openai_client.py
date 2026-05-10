"""OpenAI GPT-4o client implementation — uses openai v1+ SDK."""
import json
import logging
import time
from typing import Any

from openai import OpenAI, RateLimitError, APITimeoutError, OpenAIError
from django.conf import settings

from .base import BaseLLMClient

logger = logging.getLogger(__name__)


class OpenAIClient(BaseLLMClient):
    """Thin wrapper around the openai v1+ library with retry logic baked in."""

    def __init__(self):
        self._client = OpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.OPENAI_TIMEOUT,
            max_retries=0,  # We handle retries manually
        )
        self.model = settings.OPENAI_MODEL
        self.timeout = settings.OPENAI_TIMEOUT
        self.max_retries = settings.OPENAI_MAX_RETRIES

    def chat(
        self,
        messages: list[dict],
        response_format: dict | None = None,
        temperature: float = 0.3,
        max_tokens: int = 2000,
        **kwargs,
    ) -> str:
        """Call chat completion with automatic retry and exponential back-off."""
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
                logger.debug(
                    "OpenAI call succeeded | model=%s tokens=%s",
                    self.model,
                    response.usage.total_tokens if response.usage else "?",
                )
                return content
            except RateLimitError as exc:
                wait = 2 ** attempt
                logger.warning("OpenAI rate limit — waiting %ss (attempt %s)", wait, attempt + 1)
                time.sleep(wait)
                last_exc = exc
            except APITimeoutError as exc:
                logger.warning("OpenAI timeout on attempt %s", attempt + 1)
                last_exc = exc
            except OpenAIError as exc:
                logger.error("OpenAI error: %s", exc)
                raise

        raise RuntimeError(f"OpenAI call failed after {self.max_retries} retries: {last_exc}")

    def chat_json(self, messages: list[dict], **kwargs) -> dict:
        """Call chat and parse the response as JSON (with json_object mode)."""
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
        response = self._client.embeddings.create(
            input=text,
            model="text-embedding-3-small",
        )
        return response.data[0].embedding


# The factory handles instantiation now.
