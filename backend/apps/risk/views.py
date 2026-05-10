"""Risk Analysis view — confidence scoring and case strength assessment."""
import logging

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, RISK_PROMPT
from core.validators.schemas import RiskOutput
from core.utils import format_user_responses, get_legal_context
from .tasks import risk_analysis_task

logger = logging.getLogger(__name__)


class RiskAnalysisView(APIView):
    """
    POST /api/v1/risk-analysis/
    Body: { "case_id": "<uuid>" }
    Returns: risk level, case strength, strengths/weaknesses, limitation warnings
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = request.data.get("case_id")
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        # Dispatch async task
        task = risk_analysis_task.delay(str(case.id))

        return Response(
            {"task_id": task.id, "status": "processing"},
            status=202,
        )
