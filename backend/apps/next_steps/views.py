"""Next Steps view — actionable India-specific guidance."""
import logging

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, NEXT_STEPS_PROMPT
from core.validators.schemas import NextStepsOutput
from core.utils import format_user_responses, get_legal_context

logger = logging.getLogger(__name__)


class NextStepsView(APIView):
    """
    POST /api/v1/next-steps/
    Body: { "case_id": "<uuid>" }
    Returns: immediate actions, authorities, documents to collect, timeline
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = request.data.get("case_id")
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        formatted_responses = format_user_responses(case.answers, case.questions)
        legal_ctx = get_legal_context()

        # Enrich with helplines relevant to case category
        helplines = legal_ctx.get("helplines", [])
        portals = legal_ctx.get("key_portals", [])

        llm = get_llm_client()
        messages = [
            {"role": "system", "content": SYSTEM_PERSONA},
            {
                "role": "user",
                "content": NEXT_STEPS_PROMPT.format(
                    primary_category=case.primary_category,
                    sub_category=case.sub_category,
                    normalized_text=case.normalized_text,
                    urgency=case.urgency,
                    user_responses_formatted=formatted_responses,
                ),
            },
        ]

        try:
            raw = llm.chat_json(messages, temperature=0.3, max_tokens=1500)
            output = NextStepsOutput(**raw)
        except Exception as exc:
            logger.error("Next steps LLM error: %s", exc)
            return Response({"error": f"Next steps generation failed: {exc}"}, status=502)

        AuditLog.objects.create(
            case=case, action="next_steps",
            request_data={"case_id": case_id},
            response_data=output.model_dump(by_alias=True),
            llm_model=llm.model, success=True,
        )

        response_data = output.model_dump(by_alias=True)
        # Append relevant helplines from knowledge base
        response_data["helplines"] = helplines
        response_data["portals"] = portals

        return Response(response_data)
