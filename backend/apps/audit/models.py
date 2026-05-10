"""Audit log model — immutable record of every LLM call."""
import uuid
from django.db import models


class AuditLog(models.Model):
    """Immutable log of every API request for compliance."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(
        "cases.Case",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=50)  # classify, questions, generate, etc.
    request_data = models.JSONField()
    response_data = models.JSONField()
    llm_model = models.CharField(max_length=50, blank=True)
    tokens_used = models.PositiveIntegerField(default=0)
    latency_ms = models.PositiveIntegerField(default=0)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "audit_logs"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.action}] case={self.case_id} ok={self.success}"
