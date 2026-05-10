"""Pydantic v2 schemas to validate every LLM JSON response."""
from pydantic import BaseModel, Field, field_validator
from typing import Literal


# ── Classify ───────────────────────────────────────────────────────────────────
class ClassifyOutput(BaseModel):
    primary_category: str
    sub_category: str
    normalized_text: str
    applicable_laws: list[str]
    urgency: Literal["critical", "high", "medium", "low"]
    confidence: float = Field(ge=0.0, le=1.0)
    language_detected: Literal["hindi", "english", "hinglish", "other"]
    key_facts: list[str] = []

    @field_validator("confidence")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, v))


# ── Questions ──────────────────────────────────────────────────────────────────
class Question(BaseModel):
    id: str
    text: str
    text_hi: str = ""
    type: Literal["text", "date", "choice", "number"] = "text"
    choices: list[str] | None = None
    required: bool = True
    legal_relevance: str = ""


class QuestionsOutput(BaseModel):
    questions: list[Question]


# ── Document ───────────────────────────────────────────────────────────────────
class DocumentMetadata(BaseModel):
    jurisdiction: str
    acts_cited: list[str]
    estimated_relief: str
    next_action: str


class DocumentOutput(BaseModel):
    document_title: str
    document_type: str
    content: str
    metadata: DocumentMetadata


# ── Explain ────────────────────────────────────────────────────────────────────
class KeyTerm(BaseModel):
    term: str
    meaning: str


class ExplainOutput(BaseModel):
    plain_summary: str
    plain_summary_hi: str = ""
    your_rights: list[str]
    what_happened_legally: str
    key_terms: list[KeyTerm] = []


# ── Next Steps ─────────────────────────────────────────────────────────────────
class ImmediateAction(BaseModel):
    step: str
    deadline: str
    why: str


class Authority(BaseModel):
    name: str
    for_: str = Field(alias="for")
    url: str = ""
    helpline: str = ""

    class Config:
        populate_by_name = True


class NextStepsOutput(BaseModel):
    immediate_actions: list[ImmediateAction]
    documents_to_collect: list[str]
    authorities_to_approach: list[Authority]
    estimated_timeline: str
    cost_estimate: str
    success_factors: list[str] = []


# ── Risk ───────────────────────────────────────────────────────────────────────
class RiskOutput(BaseModel):
    overall_risk: Literal["low", "medium", "high", "critical"]
    case_strength: int = Field(ge=0, le=100)
    confidence_score: float = Field(ge=0.0, le=1.0)
    risk_factors: list[str]
    strengths: list[str]
    weaknesses: list[str]
    limitation_warning: str = ""
    legal_disclaimer: str
    recommended_action: Literal[
        "self_help", "legal_notice", "consumer_forum", "police", "court", "lawyer_needed"
    ]
