"""Google Gemini client implementation."""
import json
import logging
import time
from typing import Any

import google.generativeai as genai
from django.conf import settings

from .base import BaseLLMClient

logger = logging.getLogger(__name__)


class GeminiClient(BaseLLMClient):
    """Wrapper around the Google Generative AI SDK with retry logic."""

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.GEMINI_MODEL
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
        
        # Extract system prompt and format messages for Gemini
        system_instruction = None
        formatted_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_instruction = msg["content"]
            else:
                formatted_messages.append({
                    "role": "user" if msg["role"] == "user" else "model",
                    "parts": [msg["content"]]
                })
                
        # Initialize model
        model_kwargs = {"model_name": self.model}
        if system_instruction:
            model_kwargs["system_instruction"] = system_instruction
            
        model = genai.GenerativeModel(**model_kwargs)
        
        # Configure generation parameters
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            max_output_tokens=max_tokens,
        )
        
        if response_format and response_format.get("type") == "json_object":
            generation_config.response_mime_type = "application/json"
            
        for attempt in range(self.max_retries):
            try:
                response = model.generate_content(
                    formatted_messages,
                    generation_config=generation_config
                )
                logger.debug("Gemini call succeeded | model=%s", self.model)
                return response.text
            except Exception as exc:
                wait = 2 ** attempt
                logger.warning("Gemini API error — %s — waiting %ss (attempt %s)", exc, wait, attempt + 1)
                time.sleep(wait)
                last_exc = exc
                
        raise RuntimeError(f"Gemini call failed after {self.max_retries} retries: {last_exc}")

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
        result = genai.embed_content(
            model="models/text-embedding-004",
            content=text,
            task_type="retrieval_document",
        )
        return result['embedding']
