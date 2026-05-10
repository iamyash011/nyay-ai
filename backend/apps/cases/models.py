"""Case model — tracks a legal case from intake to resolution."""
import uuid
from django.db import models
from django.conf import settings


class Case(models.Model):
    """A single legal case owned by a user."""

    STAGE_CHOICES = [
        ("intake", "Intake"),
        ("questions", "Gathering Information"),
        ("generating", "Generating Document"),
        ("document", "Document Ready"),
        ("summary", "Summary & Next Steps"),
        ("closed", "Closed"),
    ]

    URGENCY_CHOICES = [
        ("critical", "Critical — 24–72 hours"),
        ("high", "High — 7–15 days"),
        ("medium", "Medium — 30–60 days"),
        ("low", "Low — No immediate deadline"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="cases",
        null=True,
        blank=True,  # Allow anonymous cases
    )

    # Classification data
    raw_input = models.TextField()
    normalized_text = models.TextField(blank=True)
    primary_category = models.CharField(max_length=100, blank=True)
    sub_category = models.CharField(max_length=100, blank=True)
    applicable_laws = models.JSONField(default=list)
    urgency = models.CharField(max_length=20, choices=URGENCY_CHOICES, default="medium")
    confidence = models.FloatField(default=0.0)
    language_detected = models.CharField(max_length=20, default="en")
    key_facts = models.JSONField(default=list)

    # Stage tracking
    stage = models.CharField(max_length=20, choices=STAGE_CHOICES, default="intake")

    # Q&A
    questions = models.JSONField(default=list)
    answers = models.JSONField(default=dict)
    chat_history = models.JSONField(default=list)  # List of {"role": "user/assistant", "content": "..."}

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "cases"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Case {self.id} — {self.primary_category} ({self.stage})"
