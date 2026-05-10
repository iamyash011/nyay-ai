"""Questions view — generate follow-up questions for a case."""
import logging

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, QUESTIONS_PROMPT
from core.validators.schemas import QuestionsOutput

logger = logging.getLogger(__name__)


class QuestionsView(APIView):
    """
    POST /api/v1/questions/
    Body: { "case_id": "<uuid>", "num_questions": 5 }
    Returns: list of structured questions
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = request.data.get("case_id")
        num_questions = int(request.data.get("num_questions", 5))

        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        llm = get_llm_client()
        messages = [
            {"role": "system", "content": SYSTEM_PERSONA},
            {
                "role": "user",
                "content": QUESTIONS_PROMPT.format(
                    num_questions=num_questions,
                    primary_category=case.primary_category,
                    sub_category=case.sub_category,
                    normalized_text=case.normalized_text,
                    applicable_laws=", ".join(case.applicable_laws),
                ),
            },
        ]

        try:
            raw = llm.chat_json(messages, temperature=0.3, max_tokens=1500)
            output = QuestionsOutput(**raw)
        except Exception as exc:
            logger.error("Questions LLM error: %s", exc)
            return Response({"error": f"Questions generation failed: {exc}"}, status=502)

        # Persist questions in case
        questions_data = [q.model_dump() for q in output.questions]
        case.questions = questions_data
        case.stage = "questions"
        case.save(update_fields=["questions", "stage", "updated_at"])

        AuditLog.objects.create(
            case=case,
            action="questions",
            request_data={"num_questions": num_questions},
            response_data={"questions": questions_data},
            llm_model=llm.model,
            success=True,
        )

        return Response({"case_id": str(case.id), "questions": questions_data})
