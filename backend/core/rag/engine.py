import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class RAGEngine:
    """A simple keyword-based RAG engine for retrieving legal context."""

    def __init__(self):
        self.context_path = getattr(settings, "RAG_CONTEXT_PATH", None)
        self.data = self._load_data()

    def _load_data(self):
        if not self.context_path or not self.context_path.exists():
            logger.warning("RAG context path not found: %s", self.context_path)
            return {}
        try:
            with open(self.context_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as exc:
            logger.error("Failed to load RAG context: %s", exc)
            return {}

    def get_context_for_case(self, primary_category: str, sub_category: str) -> str:
        """Retrieve relevant limitation periods and helplines for a specific category."""
        context_parts = []

        # 1. Limitation Periods
        periods = self.data.get("limitation_periods", {}).get("periods", [])
        relevant_periods = [
            p for p in periods 
            if primary_category.lower() in p["scenario"].lower() or sub_category.lower() in p["scenario"].lower()
        ]
        if relevant_periods:
            context_parts.append("RELEVANT LIMITATION PERIODS:")
            for p in relevant_periods:
                context_parts.append(f"- {p['scenario']}: {p['period']} (Critical: {p['critical']})")

        # 2. Helplines
        helplines = self.data.get("helplines", [])
        # Simple keyword match for helplines
        relevant_helplines = [
            h for h in helplines
            if any(word in h["name"].lower() for word in primary_category.lower().split("_"))
        ]
        if relevant_helplines:
            context_parts.append("\nRECOMMENDED HELPLINES:")
            for h in relevant_helplines:
                context_parts.append(f"- {h['name']}: {h['number']} ({h['available']})")

        return "\n".join(context_parts) if context_parts else "No specific legal context found for this category."

rag_engine = RAGEngine()
