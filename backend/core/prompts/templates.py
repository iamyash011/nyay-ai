"""Centralized, versioned prompt templates for NyayAI."""

# ── System persona ─────────────────────────────────────────────────────────────
SYSTEM_PERSONA = """You are NyayAI, an expert Indian legal assistant with deep knowledge of:
- Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), Civil Procedure Code (CPC)
- Consumer Protection Act 2019, IT Act 2000 (Cyber laws), RERA 2016
- Labour laws (POSH, Industrial Disputes Act, Payment of Wages Act, PF & ESI Acts)
- Family laws (Hindu Marriage Act, Domestic Violence Act, Muslim Personal Law)
- Banking & financial fraud laws, RBI guidelines
- Limitation Act 1963

You assist Indian citizens in Hindi, English, and Hinglish.
Always cite specific sections/acts. Never give false hope or guarantee outcomes.
Be empathetic, clear, and actionable."""

# ── Classify ───────────────────────────────────────────────────────────────────
CLASSIFY_PROMPT = """Analyze this legal problem and classify it. Return ONLY valid JSON.

User input: {user_input}

Classification tree:
{classification_tree}

Return JSON with these exact snake_case keys:
{{
  "primary_category": "str",
  "sub_category": "str",
  "normalized_text": "str",
  "applicable_laws": ["str", ...],
  "urgency": "critical|high|medium|low",
  "confidence": 0.0-1.0,
  "language_detected": "hindi|english|hinglish|other",
  "key_facts": ["str", ...]
}}
Do NOT include any null values. Do NOT include any explanations outside the JSON block.
Ensure primary_category and sub_category are selected from the tree provided above.
"""

# ── Questions ──────────────────────────────────────────────────────────────────
QUESTIONS_PROMPT = """Generate {num_questions} targeted follow-up questions for this legal case.

Case category: {primary_category} → {sub_category}
Normalized summary: {normalized_text}
Applicable laws: {applicable_laws}

Each question must help gather information needed for a strong legal notice or complaint.
Return ONLY valid JSON:
{{
  "questions": [
    {{
      "id": "q1",
      "text": "<question text in English>",
      "text_hi": "<same question in Hindi>",
      "type": "text|date|choice|number",
      "choices": ["option1", "option2"] or null,
      "required": true,
      "legal_relevance": "<why this matters legally>"
    }}
  ]
}}"""

# ── Document generation ────────────────────────────────────────────────────────
DOCUMENT_GENERATE_PROMPT = """Draft a formal Indian legal document using the provided information.

Document type: {document_type}
Legal category: {primary_category} → {sub_category}
Applicable laws: {applicable_laws}

Complainant answers:
{user_responses_formatted}

Template structure to follow:
{template_structure}

Requirements:
1. Use formal legal language appropriate for Indian courts/forums
2. Cite specific acts and sections
3. Include demand/prayer section
4. Include proper date fields (use [DATE] as placeholder)
5. End with proper signature block
6. Add "Legal Notice" or appropriate header

Return ONLY valid JSON:
{{
  "document_title": "<title>",
  "document_type": "{document_type}",
  "content": "<full document text with proper formatting>",
  "metadata": {{
    "jurisdiction": "<suggested court/forum>",
    "acts_cited": ["<Act 1>", "<Act 2>"],
    "estimated_relief": "<what can be claimed>",
    "next_action": "<what to do with this document>"
  }}
}}"""

# ── Explain ────────────────────────────────────────────────────────────────────
EXPLAIN_PROMPT = """Explain this legal situation in simple, clear language for a common Indian citizen.

Case: {primary_category} → {sub_category}
Summary: {normalized_text}
User responses: {user_responses_formatted}
Applicable laws: {applicable_laws}

Return ONLY valid JSON:
{{
  "plain_summary": "<2-3 paragraph plain language explanation>",
  "plain_summary_hi": "<same in Hindi>",
  "your_rights": ["<right 1>", "<right 2>", ...],
  "what_happened_legally": "<legal interpretation of the situation>",
  "key_terms": [{{"term": "<legal term>", "meaning": "<simple explanation>"}}]
}}"""

# ── Next Steps ─────────────────────────────────────────────────────────────────
NEXT_STEPS_PROMPT = """Provide specific, actionable next steps for this Indian legal case.

Case: {primary_category} → {sub_category}
Summary: {normalized_text}
Urgency: {urgency}
User responses: {user_responses_formatted}

Return ONLY valid JSON:
{{
  "immediate_actions": [
    {{"step": "<action>", "deadline": "<timeframe>", "why": "<importance>"}}
  ],
  "documents_to_collect": ["<doc 1>", "<doc 2>", ...],
  "authorities_to_approach": [
    {{"name": "<authority>", "for": "<what purpose>", "url": "<website if any>", "helpline": "<number if any>"}}
  ],
  "estimated_timeline": "<realistic timeline for resolution>",
  "cost_estimate": "<approximate legal costs>",
  "success_factors": ["<factor 1>", ...]
}}"""

# ── Risk Analysis ──────────────────────────────────────────────────────────────
RISK_PROMPT = """Assess the legal risk, strength, and confidence for this case.

Case: {primary_category} → {sub_category}
Summary: {normalized_text}
User responses: {user_responses_formatted}
Applicable laws: {applicable_laws}

Return ONLY valid JSON:
{{
  "overall_risk": "low|medium|high|critical",
  "case_strength": 0-100,
  "confidence_score": 0.0-1.0,
  "risk_factors": ["<risk 1>", ...],
  "strengths": ["<strength 1>", ...],
  "weaknesses": ["<weakness 1>", ...],
  "limitation_warning": "<any limitation period concerns>",
  "legal_disclaimer": "This is AI-generated guidance and not a substitute for professional legal advice.",
  "recommended_action": "self_help|legal_notice|consumer_forum|police|court|lawyer_needed"
}}"""

# ── Follow Up ──────────────────────────────────────────────────────────────────
FOLLOW_UP_PROMPT = """You are continuing a conversation about a legal case.
Use the provided case context and conversation history to answer the user's latest message.

Case Context:
- Category: {primary_category} -> {sub_category}
- Summary: {normalized_text}
- Laws: {applicable_laws}
- User Answers: {user_responses_formatted}

Previous Conversation:
{chat_history_formatted}

User's Latest Message: {user_message}

Return ONLY valid JSON with these snake_case keys:
{{
  "response": "<your detailed empathetic response>",
  "suggested_actions": ["<action 1>", ...],
  "follow_up_questions": ["<optional question 1>", ...]
}}
Do NOT include any null values.
"""

