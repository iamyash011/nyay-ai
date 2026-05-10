"""Register models with Django admin."""
from django.contrib import admin
from .models import Case


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ["id", "primary_category", "sub_category", "urgency", "stage", "created_at"]
    list_filter = ["stage", "urgency", "primary_category"]
    search_fields = ["id", "raw_input", "normalized_text"]
    readonly_fields = ["id", "created_at", "updated_at"]
