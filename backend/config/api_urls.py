"""API v1 URL patterns — all app endpoints collected here."""
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.views import RegisterView, ProfileView
from apps.classify.views import ClassifyView
from apps.questions.views import QuestionsView
from apps.documents.views import GenerateDocumentView, DocumentDetailView
from apps.explain.views import ExplainView
from apps.next_steps.views import NextStepsView
from apps.risk.views import RiskAnalysisView
from apps.cases.views import CaseDetailView, CaseListView, TaskStatusView, FollowUpView

urlpatterns = [
    # ── Auth ──────────────────────────────────────────────────────────────
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/profile/", ProfileView.as_view(), name="auth-profile"),

    # ── Cases ─────────────────────────────────────────────────────────────
    path("cases/", CaseListView.as_view(), name="case-list"),
    path("cases/<uuid:case_id>/", CaseDetailView.as_view(), name="case-detail"),
    path("cases/<uuid:case_id>/follow-up/", FollowUpView.as_view(), name="case-follow-up"),

    # ── Core pipeline ─────────────────────────────────────────────────────
    path("classify/", ClassifyView.as_view(), name="classify"),
    path("questions/", QuestionsView.as_view(), name="questions"),
    path("generate-document/", GenerateDocumentView.as_view(), name="generate-document"),
    path("documents/<uuid:document_id>/", DocumentDetailView.as_view(), name="document-detail"),
    path("tasks/<str:task_id>/", TaskStatusView.as_view(), name="task-status"),

    # ── Enrichment (run in parallel per frontend) ─────────────────────────
    path("explain/", ExplainView.as_view(), name="explain"),
    path("next-steps/", NextStepsView.as_view(), name="next-steps"),
    path("risk-analysis/", RiskAnalysisView.as_view(), name="risk-analysis"),
]
