"""Cases serializers and views — CRUD for cases."""
from rest_framework import serializers, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from celery.result import AsyncResult
from .models import Case


class CaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            "id", "primary_category", "sub_category", "normalized_text",
            "applicable_laws", "urgency", "confidence", "language_detected",
            "stage", "questions", "answers", "chat_history", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class CaseListView(generics.ListAPIView):
    """GET /api/v1/cases/ — List all cases for the authenticated user."""
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(user=self.request.user)


class CaseDetailView(generics.RetrieveAPIView):
    """GET /api/v1/cases/<uuid>/ — Get a specific case."""
    serializer_class = CaseSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "id"
    lookup_url_kwarg = "case_id"
    queryset = Case.objects.all()

class TaskStatusView(APIView):
    """GET /api/v1/tasks/<task_id>/ — Get status of async task."""
    permission_classes = [permissions.AllowAny]

    def get(self, request, task_id):
        task_result = AsyncResult(task_id)
        
        result_data = None
        if task_result.ready():
            # If the task returned a dict (like our generate_document_task), return it directly.
            # If it threw an Exception, task_result.result is the exception instance.
            if isinstance(task_result.result, Exception):
                result_data = {"error": str(task_result.result)}
            else:
                result_data = task_result.result

        result = {
            "task_id": task_id,
            "status": task_result.status,
            "result": result_data
        }
        return Response(result)

from django.shortcuts import get_object_or_404
from core.llm.factory import get_llm_client
from core.prompts.templates import FOLLOW_UP_PROMPT, SYSTEM_PERSONA
from core.utils import format_user_responses

class FollowUpView(APIView):
    """POST /api/v1/cases/<uuid>/follow-up/ — Ask a follow-up question."""
    permission_classes = [permissions.AllowAny]

    def post(self, request, case_id):
        case = get_object_or_404(Case, id=case_id)
        user_message = request.data.get("message", "").strip()
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # Prepare context
        formatted_responses = format_user_responses(case.answers, case.questions)
        history_formatted = "\n".join([
            f"{m['role'].upper()}: {m['content']}" for m in case.chat_history
        ])

        llm = get_llm_client()
        messages = [
            {"role": "system", "content": SYSTEM_PERSONA},
            {
                "role": "user",
                "content": FOLLOW_UP_PROMPT.format(
                    primary_category=case.primary_category,
                    sub_category=case.sub_category,
                    normalized_text=case.normalized_text,
                    applicable_laws=", ".join(case.applicable_laws),
                    user_responses_formatted=formatted_responses,
                    chat_history_formatted=history_formatted,
                    user_message=user_message,
                ),
            },
        ]

        try:
            response_json = llm.chat_json(messages)
            
            # Update history
            new_history = list(case.chat_history)
            new_history.append({"role": "user", "content": user_message})
            new_history.append({"role": "assistant", "content": response_json["response"]})
            case.chat_history = new_history
            case.save(update_fields=["chat_history", "updated_at"])

            return Response(response_json)
        except Exception as exc:
            return Response({"error": f"Follow-up failed: {exc}"}, status=502)

