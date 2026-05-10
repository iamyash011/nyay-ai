# NyayAI — Legal Assistant for Everyone ⚖️🤖

NyayAI is a modern, AI-powered legal assistant designed to help Indian citizens navigate complex legal situations in plain language (English, Hindi, and Hinglish).

## 🚀 Features

- **Instant Classification**: Describe your problem, and NyayAI identifies the relevant legal categories (Rental, Consumer, Labour, etc.).
- **Smart Follow-up Questions**: Gathers essential facts needed for a strong legal standing.
- **Automated Document Drafting**: Generates formal legal notices, FIR drafts, and complaints in minutes.
- **Risk Analysis**: Provides case strength scores, limitation warnings, and recommended next steps.
- **Interactive Consultation**: Ask follow-up questions about specific laws or procedures.
- **Case History**: Keep track of all your legal consultations in one place.

## 🛠️ Technology Stack

- **Frontend**: React, TailwindCSS, Lucide Icons, Vite.
- **Backend**: Django REST Framework.
- **AI Inference**: Groq (Llama 3.3 70B) for ultra-fast response times.
- **Background Tasks**: Celery with SQLite broker (development mode).
- **Knowledge Base**: RAG (Retrieval-Augmented Generation) based on Indian Laws.

## 🚦 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+

### Backend Setup
1. `cd backend`
2. `pip install -r requirements.txt`
3. Create a `.env` file with your `GROQ_API_KEY`.
4. `python manage.py migrate`
5. `python manage.py runserver`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📄 License
This project is for educational purposes as part of the GDG Event.
