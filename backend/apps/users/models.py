"""Custom User model with subscription tiers."""
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with UUID PK and subscription tier."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=15, blank=True)
    preferred_language = models.CharField(
        max_length=10,
        choices=[("en", "English"), ("hi", "Hindi"), ("hinglish", "Hinglish")],
        default="en",
    )
    subscription_tier = models.CharField(
        max_length=20,
        choices=[("free", "Free"), ("basic", "Basic"), ("pro", "Pro")],
        default="free",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return self.email or self.username
