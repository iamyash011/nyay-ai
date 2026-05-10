"""Document model — stores generated legal documents."""
import uuid
from django.db import models


class Document(models.Model):
    """A generated legal document tied to a case."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(
        "cases.Case",
        on_delete=models.CASCADE,
        related_name="documents",
    )
    document_title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=100)
    content = models.TextField()
    metadata = models.JSONField(default=dict)

    # Audit
    generated_at = models.DateTimeField(auto_now_add=True)
    version = models.PositiveIntegerField(default=1)

    class Meta:
        db_table = "documents"
        ordering = ["-generated_at"]

    def __str__(self):
        return f"{self.document_title} (case {self.case_id})"
