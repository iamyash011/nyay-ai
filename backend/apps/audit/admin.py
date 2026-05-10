"""Register models with Django admin for easy inspection."""
from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["action", "case", "success", "llm_model", "latency_ms", "created_at"]
    list_filter = ["action", "success", "llm_model"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]
    search_fields = ["case__id", "action"]
