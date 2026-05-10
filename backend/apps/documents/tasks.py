import logging
from celery import shared_task

from apps.cases.models import Case
from apps.documents.models import Document
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, DOCUMENT_GENERATE_PROMPT
from core.validators.schemas import DocumentOutput
from core.utils import format_user_responses
from core.rag.engine import rag_engine

logger = logging.getLogger(__name__)

# ── Legal notice template structure ───────────────────────────────────────────
LEGAL_NOTICE_TEMPLATE = """
[Sender Name]
[Sender Address]
[City, State, PIN]
[Date]

To,
[Recipient Name]
[Recipient Designation]
[Recipient Address]

Subject: LEGAL NOTICE UNDER [RELEVANT ACT]

Sir/Madam,

Under instructions from and on behalf of my client [Client Name], I hereby serve you this
legal notice as under:

1. FACTS OF THE CASE
[Facts paragraph]

2. LEGAL VIOLATIONS
[Laws violated]

3. DEMAND / PRAYER
[What is being demanded]

4. CONSEQUENCE OF NON-COMPLIANCE
[What happens if ignored — legal action details]

Kindly comply within [X] days of receipt of this notice failing which my client shall be
constrained to initiate appropriate legal proceedings before the competent court/forum at
your cost and risk.

Yours faithfully,

[Sender Name]
Advocate / Complainant
"""

DOCUMENT_TEMPLATES = {
    "legal_notice": LEGAL_NOTICE_TEMPLATE,
    "consumer_complaint": "Consumer Complaint to District Consumer Disputes Redressal Commission...",
    "police_complaint": "Complaint/FIR Application to the Station House Officer...",
    "rbi_grievance": "Complaint to RBI Banking Ombudsman...",
    "labour_complaint": "Complaint to Labour Commissioner...",
}

@shared_task
def generate_document_task(case_id, document_type, user_responses):
    try:
        case = Case.objects.get(id=case_id)
    except Case.DoesNotExist:
        return {"error": "Case not found"}

    # Format Q&A for prompt
    formatted_responses = format_user_responses(user_responses, case.questions)
    template_structure = DOCUMENT_TEMPLATES.get(document_type, LEGAL_NOTICE_TEMPLATE)

    # Retrieve RAG context
    rag_context = rag_engine.get_context_for_case(case.primary_category, case.sub_category)

    llm = get_llm_client()
    messages = [
        {"role": "system", "content": SYSTEM_PERSONA},
        {
            "role": "user",
            "content": DOCUMENT_GENERATE_PROMPT.format(
                document_type=document_type,
                primary_category=case.primary_category,
                sub_category=case.sub_category,
                applicable_laws=", ".join(case.applicable_laws),
                user_responses_formatted=formatted_responses,
                template_structure=template_structure,
            ) + f"\n\nADDITIONAL LEGAL CONTEXT (RAG):\n{rag_context}",
        },
    ]

    try:
        raw = llm.chat_json(messages, temperature=0.2, max_tokens=3000)
        output = DocumentOutput(**raw)
    except Exception as exc:
        logger.error("Document generation LLM error: %s", exc)
        case.stage = "questions"
        case.save(update_fields=["stage"])
        return {"error": str(exc)}

    # Persist document
    doc = Document.objects.create(
        case=case,
        document_title=output.document_title,
        document_type=output.document_type,
        content=output.content,
        metadata=output.metadata.model_dump(),
    )
    case.stage = "document"
    case.save(update_fields=["stage", "updated_at"])

    AuditLog.objects.create(
        case=case,
        action="generate_document",
        request_data={"document_type": document_type},
        response_data={"document_id": str(doc.id), "title": doc.document_title},
        llm_model=llm.model,
        success=True,
    )

    return {
        "document_id": str(doc.id),
        "case_id": str(case.id),
        "document_title": doc.document_title,
        "document_type": doc.document_type,
    }
