"""Classify view — the first step in the NyayAI pipeline."""
import json
import logging

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, CLASSIFY_PROMPT
from core.validators.schemas import ClassifyOutput
from core.utils import get_legal_context

logger = logging.getLogger(__name__)


class ClassifyView(APIView):
    """
    POST /api/v1/classify/
    Body: { "user_input": "Mere boss ne salary nahi di 3 mahine se..." }
    Returns: case_id + classification data
    """
    permission_classes = [AllowAny]

    def post(self, request):
        user_input = request.data.get("user_input", "").strip()
        if not user_input:
            return Response({"error": "user_input is required"}, status=400)
        if len(user_input) > 5000:
            return Response({"error": "Input too long (max 5000 characters)"}, status=400)

        llm = get_llm_client()
        legal_ctx = get_legal_context()
        classification_tree_str = json.dumps(legal_ctx["classification_tree"], indent=2)

        messages = [
            {"role": "system", "content": SYSTEM_PERSONA},
            {
                "role": "user",
                "content": CLASSIFY_PROMPT.format(
                    user_input=user_input,
                    classification_tree=classification_tree_str,
                ),
            },
        ]

        try:
            raw = llm.chat_json(messages, temperature=0.2, max_tokens=800)
            output = ClassifyOutput(**raw)
        except Exception as exc:
            logger.error("Classify LLM error: %s", exc)
            return Response({"error": f"Classification failed: {exc}"}, status=502)

        # Persist case
        user = request.user if request.user.is_authenticated else None
        case = Case.objects.create(
            user=user,
            raw_input=user_input,
            normalized_text=output.normalized_text,
            primary_category=output.primary_category,
            sub_category=output.sub_category,
            applicable_laws=output.applicable_laws,
            urgency=output.urgency,
            confidence=output.confidence,
            language_detected=output.language_detected,
            key_facts=output.key_facts,
            stage="intake",
        )

        # Audit log
        AuditLog.objects.create(
            case=case,
            action="classify",
            request_data={"user_input": user_input},
            response_data=output.model_dump(),
            llm_model=llm.model,
            success=True,
        )

        return Response(
            {
                "case_id": str(case.id),
                **output.model_dump(),
            },
            status=status.HTTP_201_CREATED,
        )
