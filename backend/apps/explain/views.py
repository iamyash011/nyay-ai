"""Explain view — plain-language legal explanation for a case."""
import logging

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, EXPLAIN_PROMPT
from core.validators.schemas import ExplainOutput
from core.utils import format_user_responses

logger = logging.getLogger(__name__)


class ExplainView(APIView):
    """
    POST /api/v1/explain/
    Body: { "case_id": "<uuid>" }
    Returns: plain-language explanation + rights + key terms
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = request.data.get("case_id")
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        formatted_responses = format_user_responses(case.answers, case.questions)
        llm = get_llm_client()

        messages = [
            {"role": "system", "content": SYSTEM_PERSONA},
            {
                "role": "user",
                "content": EXPLAIN_PROMPT.format(
                    primary_category=case.primary_category,
                    sub_category=case.sub_category,
                    normalized_text=case.normalized_text,
                    user_responses_formatted=formatted_responses,
                    applicable_laws=", ".join(case.applicable_laws),
                ),
            },
        ]

        try:
            raw = llm.chat_json(messages, temperature=0.3, max_tokens=1500)
            output = ExplainOutput(**raw)
        except Exception as exc:
            logger.error("Explain LLM error: %s", exc)
            return Response({"error": f"Explanation failed: {exc}"}, status=502)

        AuditLog.objects.create(
            case=case, action="explain",
            request_data={"case_id": case_id},
            response_data=output.model_dump(),
            llm_model=llm.model, success=True,
        )

        return Response(output.model_dump())
