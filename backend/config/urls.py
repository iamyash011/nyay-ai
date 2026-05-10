"""NyayAI URL configuration — API v1 routing."""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok", "service": "NyayAI Legal Assistant"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check),
    path("api/v1/", include("config.api_urls")),
]
