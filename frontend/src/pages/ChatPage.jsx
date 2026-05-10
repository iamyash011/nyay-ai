import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { api } from "../services/api";
import MessageBubble from "../components/MessageBubble";
import ChatInput from "../components/ChatInput";
import QuestionCard from "../components/QuestionCard";
import ProgressBar from "../components/ProgressBar";
import TypingIndicator from "../components/TypingIndicator";
import ErrorBanner from "../components/ErrorBanner";
import { Scale } from "lucide-react";

const STAGE_LABELS = {
  intake: "Describe your problem",
  questions: "Answering questions",
  generating: "Generating your document",
  document: "Document ready",
  summary: "Next steps",
};

export default function ChatPage() {
  const location = useLocation();
  const bottomRef = useRef(null);
  const initDone = useRef(false);
  const store = useChatStore();
  const [questionIndex, setQuestionIndex] = useState(0);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [store.messages, store.isTyping]);

  // Handle prefill from landing page (guard prevents StrictMode double-mount duplicates)
  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;
    if (location.state?.prefill && store.messages.length === 0) {
      handleUserInput(location.state.prefill);
    } else if (store.messages.length === 0) {
      store.addMessage({
        role: "assistant",
        content:
          "Namaste! 🙏 Main NyayAI hoon — aapka AI legal assistant.\n\nApni samasya Hindi, English, ya Hinglish mein batayein. Main samjhne ki koshish karunga aur aapki madad karunga.\n\n*Hello! I'm NyayAI. Describe your legal problem in any language — I'll understand.*",
      });
    }
  }, []);

  const handleUserInput = async (text) => {
    if (!text.trim()) return;
    store.clearError();
    store.addMessage({ role: "user", content: text });
    store.setTyping(true);

    try {
      if (store.stage === "intake") {
        const result = await api.classify(text);
        store.setCaseId(result.case_id);
        store.setTyping(false);

        const lawList = result.applicable_laws?.slice(0, 2).join(", ") || "Indian law";
        store.addMessage({
          role: "assistant",
          type: "classification",
          content: `I've understood your issue. This appears to be a **${result.primary_category.replace(/_/g, " ")}** matter (${result.sub_category.replace(/_/g, " ")}).`,
          meta: {
            category: result.primary_category,
            laws: result.applicable_laws,
            urgency: result.urgency,
            confidence: result.confidence,
          },
        });

        store.addMessage({
          role: "assistant",
          content: `I need to ask you a few questions to draft the right legal document. Let's go step by step.`,
        });

        // Fetch questions
        store.setTyping(true);
        const qResult = await api.getQuestions(result.case_id, 5);
        store.setTyping(false);
        store.setQuestions(qResult.questions);
        store.setStage("questions");
        setQuestionIndex(0);

      } else if (store.stage === "questions") {
        const q = store.currentQuestions[questionIndex];
        if (q) store.setAnswer(q.id, text);
        advanceQuestion();
      }
    } catch (e) {
      store.setTyping(false);
      store.setError(e.message);
    }
  };

  const handleAnswer = async (qId, value) => {
    store.setAnswer(qId, value);
    store.addMessage({ role: "user", content: String(value) });
    advanceQuestion();
  };

  const advanceQuestion = async () => {
    const next = questionIndex + 1;
    if (next < store.currentQuestions.length) {
      setQuestionIndex(next);
    } else {
      // All questions answered → generate document
      store.setStage("generating");
      store.addMessage({ role: "assistant", content: "Great! I have all the information I need. Drafting your legal document now..." });
      store.setTyping(true);
      try {
        const docResult = await api.generateDocument(store.caseId, "legal_notice", store.answers);
        store.setTyping(false);
        store.addMessage({
          role: "assistant",
          type: "document_ready",
          content: `Your **${docResult.document_title}** is ready! Click below to view and download it.`,
          meta: { documentId: docResult.document_id, caseId: store.caseId },
        });
        store.setStage("document");
      } catch (e) {
        store.setTyping(false);
        store.setError(e.message);
      }
    }
  };

  const stageIndex = ["intake", "questions", "generating", "document", "summary"].indexOf(store.stage);
  const currentQuestion = store.stage === "questions" ? store.currentQuestions[questionIndex] : null;

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1e] text-white font-inter">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d1526]">
        <div className="flex items-center gap-2">
          <Scale size={20} className="text-amber-400" />
          <span className="font-bold">NyayAI</span>
        </div>
        <ProgressBar current={stageIndex} total={4} labels={Object.values(STAGE_LABELS)} />
        <select
          value={store.language}
          onChange={(e) => store.setLanguage(e.target.value)}
          className="text-xs bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white/70"
        >
          <option value="en">EN</option>
          <option value="hi">हिं</option>
          <option value="hinglish">Mix</option>
        </select>
      </div>

      {/* Error Banner */}
      {store.error && <ErrorBanner message={store.error} onDismiss={store.clearError} />}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {store.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {store.isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Question Card (progressive disclosure) */}
      {currentQuestion && store.stage === "questions" && (
        <div className="px-4 pb-2">
          <QuestionCard
            question={currentQuestion}
            index={questionIndex}
            total={store.currentQuestions.length}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {/* Input */}
      {store.stage !== "generating" && store.stage !== "document" && (
        <div className="px-4 pb-4">
          <ChatInput
            onSend={handleUserInput}
            placeholder={
              store.stage === "intake"
                ? "Apni samasya batayein... (Hindi/English/Hinglish)"
                : "Type your answer..."
            }
            disabled={store.isTyping}
          />
        </div>
      )}
    </div>
  );
}
