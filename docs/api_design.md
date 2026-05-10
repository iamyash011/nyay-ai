# 🔌 API Design — India Legal Assistant

Base URL: `/api/v1/`
Auth: Bearer JWT token in all requests.

---

## POST /classify

Normalize Hinglish input and classify the legal issue.

### Request
```json
{
  "user_input": "Mere employer ne 3 mahine se salary nahi di aur ab bol raha hai resign karo",
  "user_id": "uuid"
}
```

### Response
```json
{
  "case_id": "uuid",
  "normalized_text": "My employer has not paid salary for 3 months and is now asking me to resign.",
  "detected_language": "hinglish",
  "primary_category": "employment_dispute",
  "sub_category": "salary_withholding",
  "confidence": 0.94,
  "applicable_laws": [
    "Payment of Wages Act 1936, Section 3",
    "Industrial Disputes Act 1947, Section 25F",
    "Labour Court jurisdiction"
  ],
  "jurisdiction": "labour",
  "urgency": "high",
  "key_entities": {
    "persons": ["employer"],
    "amounts": [],
    "dates": [],
    "locations": []
  },
  "reasoning": "Non-payment of wages for 3 months with pressure to resign constitutes salary withholding and potentially constructive dismissal."
}
```

---

## POST /questions

Generate follow-up questions for a case.

### Request
```json
{
  "case_id": "uuid",
  "num_questions": 5
}
```

### Response
```json
{
  "case_id": "uuid",
  "questions": [
    {
      "id": "q1",
      "question": "What is your employer's full company name and registered address?",
      "type": "text",
      "options": [],
      "required": true,
      "legal_purpose": "Required to address the legal notice to the correct entity"
    },
    {
      "id": "q2",
      "question": "What is the exact date from which your salary stopped?",
      "type": "date",
      "options": [],
      "required": true,
      "legal_purpose": "Determines the period of default under Payment of Wages Act"
    },
    {
      "id": "q3",
      "question": "What is your monthly salary as per your appointment letter?",
      "type": "amount",
      "options": [],
      "required": true,
      "legal_purpose": "Establishes the total dues amount"
    },
    {
      "id": "q4",
      "question": "Have you sent any written communication (email/WhatsApp) to HR/management about this?",
      "type": "yes_no",
      "options": ["Yes", "No"],
      "required": true,
      "legal_purpose": "Prior communication strengthens your case and is required for demand notice"
    },
    {
      "id": "q5",
      "question": "Do you have your appointment letter, salary slips, or any bank credit records?",
      "type": "multiple_choice",
      "options": ["Appointment letter", "Salary slips", "Bank records", "None of these"],
      "required": false,
      "legal_purpose": "Documentary evidence needed to support the claim"
    }
  ]
}
```

---

## POST /generate-document

Generate a formatted legal document.

### Request
```json
{
  "case_id": "uuid",
  "document_type": "legal_notice",
  "user_responses": {
    "q1": "ABC Technologies Pvt Ltd, 4th Floor, DLF Cyber City, Gurugram, Haryana 122002",
    "q2": "2026-02-01",
    "q3": "75000",
    "q4": "Yes",
    "q5": ["Appointment letter", "Salary slips"]
  }
}
```

### Response
```json
{
  "document_id": "uuid",
  "document_type": "legal_notice",
  "document_title": "Legal Notice — Non-Payment of Wages",
  "document_body": "LEGAL NOTICE\n\nTo,\nThe Director / HR Manager\nABC Technologies Pvt Ltd\n4th Floor, DLF Cyber City, Gurugram, Haryana 122002\n\nDate: 02 May 2026\n\nSub: Legal Notice for Recovery of Outstanding Salary Dues\n\nDear Sir/Madam,\n\nI, [CLIENT NAME], employed as [DESIGNATION] with your organization since [JOINING DATE], hereby serve this legal notice upon you...\n\n[Full legal text continues...]",
  "sections_included": ["header", "parties", "facts", "legal_basis", "demand", "consequence", "signature"],
  "missing_information": ["Client full name", "Designation", "Joining date"],
  "disclaimer": "This is an AI-generated draft. Please review with a qualified advocate before sending.",
  "suggested_send_to": "Director + HR Manager via Registered Post with Acknowledgement Due (RPAD)",
  "filing_deadline_note": "Send within 60 days of last default to preserve rights under Payment of Wages Act"
}
```

---

## POST /explain

Plain-language explanation of the legal situation.

### Request
```json
{ "case_id": "uuid" }
```

### Response
```json
{
  "case_id": "uuid",
  "summary": "Your employer is legally required to pay your salary on time. Withholding 3 months' pay is a violation of the Payment of Wages Act 1936. Pressuring you to resign without full dues is also potentially illegal.",
  "user_rights": [
    "Right to receive full salary within 7–10 days of wage period end (Payment of Wages Act, S.3)",
    "Right to approach Labour Court for recovery of wages (S.15)",
    "Right to claim compensation up to 10x unpaid wages if delay is malicious (S.20)",
    "Protection against forced resignation — this may constitute constructive dismissal"
  ],
  "other_party_obligations": [
    "Must pay all pending wages immediately",
    "Cannot deduct wages without written authorization",
    "Cannot force resignation as a substitute for termination procedures"
  ],
  "typical_outcomes": [
    "Most salary recovery cases settle at Labour Court notice stage",
    "If contested, Labour Court orders typically take 3–6 months",
    "Many employers pay immediately when a formal legal notice is received"
  ],
  "important_caveat": "This is general legal information, not advice for your specific case. Laws may vary by state. Consult a qualified advocate."
}
```

---

## POST /next-steps

Actionable India-specific next steps.

### Request
```json
{ "case_id": "uuid" }
```

### Response
```json
{
  "case_id": "uuid",
  "immediate_actions": [
    {
      "step": 1,
      "action": "Send a formal legal notice to employer via RPAD",
      "deadline": "Within 7 days",
      "how_to": "Use the generated notice document. Print on plain paper, sign, and send via India Post Registered Post. Keep the receipt.",
      "portal_or_contact": "India Post: https://www.indiapost.gov.in"
    },
    {
      "step": 2,
      "action": "File complaint with Labour Commissioner",
      "deadline": "If no response in 15 days",
      "how_to": "Visit your district Labour Commissioner office with copies of notice, salary slips, appointment letter",
      "portal_or_contact": "Shram Suvidha Portal: https://shramsuvidha.gov.in"
    },
    {
      "step": 3,
      "action": "File application in Labour Court under Payment of Wages Act S.15",
      "deadline": "Within 1 year of last unpaid wage",
      "how_to": "File Form I before the Payment of Wages Authority (Labour Court) in your jurisdiction",
      "portal_or_contact": "eCourts: https://services.ecourts.gov.in"
    }
  ],
  "documents_to_gather": [
    "Appointment letter",
    "All salary slips (paid months)",
    "Bank statements showing last salary credit",
    "Email/WhatsApp screenshots of salary complaints sent",
    "Employee ID card or any employment proof"
  ],
  "authorities_to_contact": [
    {
      "authority": "Labour Commissioner (District)",
      "why": "Mediates salary disputes before litigation",
      "how_to_reach": "Visit district collectorate or Shram Suvidha portal"
    },
    {
      "authority": "National Labour Helpline",
      "why": "Free guidance on labour rights",
      "how_to_reach": "Call 14434 (Toll-free)"
    }
  ],
  "estimated_timeline": "Resolution in 1–6 months depending on employer response",
  "legal_aid_option": "If you cannot afford a lawyer, contact NALSA at nalsa.gov.in or your State Legal Services Authority (SLSA) for free legal aid"
}
```

---

## POST /risk-analysis

Assess case viability and confidence.

### Request
```json
{ "case_id": "uuid" }
```

### Response
```json
{
  "case_id": "uuid",
  "overall_risk": "low",
  "confidence_score": 0.87,
  "case_strength": "strong",
  "key_strengths": [
    "Clear statutory violation under Payment of Wages Act",
    "User has documentary evidence (salary slips, appointment letter)",
    "Prior written communication exists",
    "3-month non-payment clearly establishes a pattern"
  ],
  "key_weaknesses": [
    "No bank statement confirming last salary received",
    "Exact joining date not confirmed"
  ],
  "evidence_gaps": [
    "Bank statement for salary credits",
    "Written proof of employer's resignation pressure"
  ],
  "opposing_arguments": [
    "Employer may claim salary was paid in cash",
    "Employer may dispute employment relationship if no appointment letter registered"
  ],
  "success_probability": "75%–90%",
  "recommendation": "proceed",
  "disclaimer": "This AI assessment is based on information provided. It is not legal advice. Actual outcomes depend on evidence, jurisdiction, and judicial discretion. Consult a qualified advocate."
}
```
