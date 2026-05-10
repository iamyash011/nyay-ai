# 🗄️ Database Design — India Legal Assistant

## PostgreSQL Schema

---

### Table: users

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(15),
    full_name       VARCHAR(255),
    preferred_lang  VARCHAR(20) DEFAULT 'en',  -- 'en', 'hi', 'hinglish'
    subscription    VARCHAR(20) DEFAULT 'free', -- 'free', 'basic', 'pro'
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
```

---

### Table: cases

```sql
CREATE TABLE cases (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    raw_input           TEXT NOT NULL,
    normalized_text     TEXT,
    detected_language   VARCHAR(20),
    primary_category    VARCHAR(50),
    sub_category        VARCHAR(50),
    jurisdiction        VARCHAR(30),  -- 'civil', 'criminal', 'labour', 'consumer', 'cyber'
    urgency             VARCHAR(20),  -- 'low', 'medium', 'high', 'critical'
    confidence_score    NUMERIC(4,3),
    applicable_laws     JSONB,        -- ["Act Name, Section X", ...]
    status              VARCHAR(30) DEFAULT 'classified',
    -- Statuses: classified → questions_sent → responses_collected → document_generated → completed
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_category ON cases(primary_category, sub_category);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_created ON cases(created_at DESC);
```

---

### Table: user_responses

```sql
CREATE TABLE user_responses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    question_id VARCHAR(10) NOT NULL,  -- 'q1', 'q2', ...
    question    TEXT NOT NULL,
    answer      TEXT,
    answer_type VARCHAR(20),           -- 'text', 'date', 'amount', 'yes_no', 'multiple_choice'
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_responses_case_id ON user_responses(case_id);
```

---

### Table: documents

```sql
CREATE TABLE documents (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id             UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id             UUID NOT NULL REFERENCES users(id),
    document_type       VARCHAR(50) NOT NULL,
    -- Types: 'legal_notice', 'consumer_complaint', 'fir_draft', 'police_complaint',
    --        'labour_court_application', 'rent_agreement_dispute', 'reply_notice'
    document_title      VARCHAR(255),
    document_body       TEXT NOT NULL,
    sections_included   JSONB,
    missing_information JSONB,
    suggested_send_to   TEXT,
    filing_deadline     TEXT,
    version             INTEGER DEFAULT 1,
    is_final            BOOLEAN DEFAULT FALSE,
    disclaimer          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_type ON documents(document_type);
```

---

### Table: logs

```sql
CREATE TABLE logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id         UUID REFERENCES cases(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    endpoint        VARCHAR(100) NOT NULL,    -- '/api/v1/classify'
    prompt_version  VARCHAR(20),
    llm_model       VARCHAR(50),             -- 'gpt-4o', 'gpt-4-turbo'
    prompt_tokens   INTEGER,
    completion_tokens INTEGER,
    total_cost_usd  NUMERIC(8,6),
    latency_ms      INTEGER,
    raw_prompt      TEXT,                    -- Stored encrypted in prod
    raw_response    TEXT,                    -- Stored encrypted in prod
    validation_passed BOOLEAN,
    retry_count     INTEGER DEFAULT 0,
    error           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_case_id ON logs(case_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_endpoint ON logs(endpoint);
CREATE INDEX idx_logs_created ON logs(created_at DESC);
```

---

## Entity Relationship Diagram

```
users ──────────────────────────────────┐
  │                                     │
  │ 1:N                                 │ 1:N
  ▼                                     ▼
cases ──── 1:N ──── user_responses    documents
  │
  │ 1:N
  ▼
logs
```

---

## Indexing Strategy

| Table | Key Queries | Index |
|-------|-------------|-------|
| cases | By user, by category, by status | Composite (user_id, status) |
| user_responses | All answers for a case | case_id |
| documents | All docs for a case, by type | case_id, document_type |
| logs | Cost analysis, error rate | endpoint, created_at |

---

## Django Models (Summary)

```python
# apps/cases/models.py
class Case(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases')
    raw_input = models.TextField()
    normalized_text = models.TextField(blank=True)
    primary_category = models.CharField(max_length=50, blank=True)
    sub_category = models.CharField(max_length=50, blank=True)
    jurisdiction = models.CharField(max_length=30, blank=True)
    urgency = models.CharField(max_length=20, blank=True)
    confidence_score = models.DecimalField(max_digits=4, decimal_places=3, null=True)
    applicable_laws = models.JSONField(default=list)
    status = models.CharField(max_length=30, default='classified')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['primary_category', 'sub_category']),
        ]
```
