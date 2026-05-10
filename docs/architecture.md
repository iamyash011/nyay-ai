# 🏛️ India Legal Assistant — System Architecture

## 1. Folder Structure

```
legal_assistant/
├── config/
│   ├── settings/
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   └── wsgi.py
│
├── apps/
│   ├── users/               # Auth, profile, subscription
│   ├── cases/               # Case lifecycle management
│   ├── classify/            # LLM classification pipeline
│   ├── questions/           # Follow-up question engine
│   ├── documents/           # Document generation engine
│   ├── explain/             # Plain-language explanation
│   ├── next_steps/          # Actionable guidance
│   ├── risk/                # Risk & confidence scoring
│   └── audit/               # Logging & compliance
│
├── core/
│   ├── llm/
│   │   ├── base.py          # Abstract LLM interface
│   │   ├── openai_client.py # OpenAI implementation
│   │   └── retry.py         # Retry + fallback logic
│   ├── prompts/             # All prompt templates
│   ├── validators/          # Output schema validators
│   ├── templates/           # Legal document templates
│   └── utils.py
│
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
│
└── manage.py
```

---

## 2. Module Explanations

| Module | Purpose |
|--------|---------|
| `users` | JWT auth, user profile, subscription tier |
| `cases` | Tracks a legal case from start to finish |
| `classify` | Normalizes Hinglish input, classifies issue type |
| `questions` | Generates smart follow-up questions per issue |
| `documents` | Hybrid template+LLM document generation |
| `explain` | Plain-language summary of legal situation |
| `next_steps` | Actionable India-specific next steps |
| `risk` | Confidence scoring, risk level, caveats |
| `audit` | Full request/response logs for compliance |
| `core/llm` | Abstracted LLM client (swap OpenAI → others) |
| `core/prompts` | Centralized, versioned prompt management |
| `core/validators` | Pydantic schemas to validate LLM JSON output |

---

## 3. Data Flow

```
User Input (Hinglish/English)
        │
        ▼
[POST /classify]
  → Normalize text (LLM)
  → Classify issue type + sub-type (LLM)
  → Create Case record in DB
        │
        ▼
[POST /questions]
  → Load issue type from Case
  → Generate 3–5 follow-up questions (LLM)
  → Return structured Q list
        │
        ▼
User answers questions → stored in user_responses
        │
        ▼
[POST /generate-document]
  → Load template by issue type
  → Fill template slots with user data (LLM)
  → Validate output against schema
  → Store in documents table
        │
        ▼
[POST /explain] + [POST /next-steps] + [POST /risk-analysis]
  → Run in parallel using case_id
  → Return enriched case summary
```

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Django 4.2 + DRF |
| Database | PostgreSQL 15 |
| LLM | OpenAI GPT-4o (abstracted) |
| Cache | Redis (response caching) |
| Task Queue | Celery + Redis (async doc gen) |
| Auth | JWT (djangorestframework-simplejwt) |
| Validation | Pydantic v2 |
| Deployment | Gunicorn + Nginx |
