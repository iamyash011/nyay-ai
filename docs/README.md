# 🏛️ India AI Legal Assistant — Complete Design Reference

## Document Map

| Section | File |
|---------|------|
| 1. Architecture | [architecture.md](./architecture.md) |
| 2. Prompts | [prompts.md](./prompts.md) |
| 3. API Design | [api_design.md](./api_design.md) |
| 4. Database | [database.md](./database.md) |
| 5. Document Engine + Safety | [document_engine_and_safety.md](./document_engine_and_safety.md) |

---

## Quick Reference: Dependencies

```
# requirements/base.txt
django==4.2.*
djangorestframework==3.15.*
djangorestframework-simplejwt==5.3.*
psycopg2-binary==2.9.*
openai==1.30.*
pydantic==2.7.*
celery==5.3.*
redis==5.0.*
python-dotenv==1.0.*
```

---

## Quick Reference: ENV Variables

```bash
# .env
SECRET_KEY=your-django-secret-key
DEBUG=False
DATABASE_URL=postgresql://user:pass@localhost:5432/legal_db
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
OPENAI_MAX_TOKENS=4096
REDIS_URL=redis://localhost:6379/0
ALLOWED_HOSTS=yourdomain.com,localhost
```

---

## Implementation Priority Order

```
Week 1:
  ✅ Project setup (Django + DRF + PostgreSQL)
  ✅ User auth (JWT)
  ✅ LLM abstraction layer (core/llm/)
  ✅ Retry + validation logic

Week 2:
  ✅ /classify endpoint (normalize + classify)
  ✅ /questions endpoint
  ✅ Case + UserResponse models

Week 3:
  ✅ Document templates (3 types minimum)
  ✅ /generate-document endpoint
  ✅ Hallucination checks

Week 4:
  ✅ /explain, /next-steps, /risk-analysis
  ✅ Logging table + audit trail
  ✅ Rate limiting + safety filters

Week 5:
  ✅ Testing (unit + integration)
  ✅ Cost tracking dashboard
  ✅ Deployment (Gunicorn + Nginx)
```
