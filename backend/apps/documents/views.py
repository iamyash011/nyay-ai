"""Documents views — generate and retrieve legal documents."""
import logging

from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, DOCUMENT_GENERATE_PROMPT
from core.validators.schemas import DocumentOutput
from core.utils import format_user_responses

from .models import Document
from .tasks import generate_document_task

logger = logging.getLogger(__name__)




class GenerateDocumentView(APIView):
    """
    POST /api/v1/generate-document/
    Body: { "case_id": "<uuid>", "document_type": "legal_notice", "user_responses": {...} }
    Returns: document_id + document metadata
    """
    permission_classes = [AllowAny]

    def post(self, request):
        case_id = request.data.get("case_id")
        document_type = request.data.get("document_type", "legal_notice")
        user_responses = request.data.get("user_responses", {})

        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            return Response({"error": "Case not found"}, status=404)

        # Save answers to case
        case.answers = user_responses
        case.stage = "generating"
        case.save(update_fields=["answers", "stage", "updated_at"])

        # Dispatch async task
        task = generate_document_task.delay(str(case.id), document_type, user_responses)

        return Response(
            {"task_id": task.id, "status": "processing"},
            status=202,
        )


class DocumentDetailView(APIView):
    """GET /api/v1/documents/<uuid>/ — Fetch full document content."""
    permission_classes = [AllowAny]

    def get(self, request, document_id):
        try:
            doc = Document.objects.select_related("case").get(id=document_id)
        except Document.DoesNotExist:
            return Response({"error": "Document not found"}, status=404)

        return Response(
            {
                "document_id": str(doc.id),
                "case_id": str(doc.case_id),
                "document_title": doc.document_title,
                "document_type": doc.document_type,
                "content": doc.content,
                "metadata": doc.metadata,
                "generated_at": doc.generated_at.isoformat(),
            }
        )
