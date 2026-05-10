import logging
from celery import shared_task

from apps.cases.models import Case
from apps.audit.models import AuditLog
from core.llm.factory import get_llm_client
from core.prompts.templates import SYSTEM_PERSONA, RISK_PROMPT
from core.validators.schemas import RiskOutput
from core.utils import format_user_responses
from core.rag.engine import rag_engine

logger = logging.getLogger(__name__)

@shared_task
def risk_analysis_task(case_id):
    try:
        case = Case.objects.get(id=case_id)
    except Case.DoesNotExist:
        return {"error": "Case not found"}

    formatted_responses = format_user_responses(case.answers, case.questions)
    
    # Retrieve RAG context
    rag_context = rag_engine.get_context_for_case(case.primary_category, case.sub_category)

    llm = get_llm_client()
    messages = [
        {"role": "system", "content": SYSTEM_PERSONA},
        {
            "role": "user",
            "content": RISK_PROMPT.format(
                primary_category=case.primary_category,
                sub_category=case.sub_category,
                normalized_text=case.normalized_text,
                user_responses_formatted=formatted_responses,
                applicable_laws=", ".join(case.applicable_laws),
            ) + f"\n\nADDITIONAL LEGAL CONTEXT (RAG):\n{rag_context}",
        },
    ]

    try:
        raw = llm.chat_json(messages, temperature=0.2, max_tokens=1000)
        output = RiskOutput(**raw)
    except Exception as exc:
        logger.error("Risk analysis LLM error: %s", exc)
        return {"error": str(exc)}

    AuditLog.objects.create(
        case=case,
        action="risk_analysis",
        request_data={"case_id": case_id},
        response_data=output.model_dump(),
        llm_model=llm.model,
        success=True,
    )

    # Update case stage to summary
    case.stage = "summary"
    case.save(update_fields=["stage", "updated_at"])

    return output.model_dump()
