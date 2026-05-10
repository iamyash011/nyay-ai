"""Shared utilities for NyayAI backend."""
import json
import logging
from pathlib import Path
from django.conf import settings
from rest_framework.views import exception_handler
from rest_framework.response import Response

logger = logging.getLogger(__name__)

# ── Legal context loader ───────────────────────────────────────────────────────
_legal_context: dict | None = None


def get_legal_context() -> dict:
    """Load the legal_context.json knowledge base (cached after first load)."""
    global _legal_context
    if _legal_context is None:
        kb_path = getattr(settings, "RAG_CONTEXT_PATH", None)
        if not kb_path:
            # Fallback for non-django environments if needed
            kb_path = Path(__file__).resolve().parents[1] / "knowledge_base" / "legal_context.json"
            
        with open(kb_path, "r", encoding="utf-8") as f:
            _legal_context = json.load(f)
        logger.info("Legal context loaded from %s", kb_path)
    return _legal_context


def format_user_responses(answers: dict, questions: list) -> str:
    """Format Q&A pairs into readable text for prompts."""
    lines = []
    for q in questions:
        qid = q.get("id") or q.id if hasattr(q, "id") else str(q)
        answer = answers.get(qid, "Not provided")
        question_text = q.get("text") if isinstance(q, dict) else getattr(q, "text", str(q))
        lines.append(f"Q: {question_text}\nA: {answer}")
    return "\n\n".join(lines) if lines else str(answers)


# ── DRF custom exception handler ──────────────────────────────────────────────
def custom_exception_handler(exc, context):
    """Return consistent error envelope: {"error": "...", "detail": "..."}"""
    response = exception_handler(exc, context)

    if response is not None:
        error_msg = str(exc)
        if hasattr(exc, "detail"):
            error_msg = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
        response.data = {
            "error": error_msg,
            "status_code": response.status_code,
        }
    return response
