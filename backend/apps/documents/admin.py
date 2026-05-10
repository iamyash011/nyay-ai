"""Register Document model with Django admin."""
from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ["document_title", "document_type", "case", "generated_at"]
    list_filter = ["document_type"]
    search_fields = ["document_title", "case__id"]
    readonly_fields = ["id", "generated_at"]
