import { useState } from "react";
import { HelpCircle } from "lucide-react";

/**
 * Backend Question schema (from core/validators/schemas.py):
 *   id: str
 *   text: str
 *   text_hi: str
 *   type: "text" | "date" | "choice" | "number"
 *   choices: list[str] | null
 *   required: bool
 *   legal_relevance: str
 */
export default function QuestionCard({ question, index, total, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [text, setText] = useState("");

  const handleSubmit = () => {
    const val =
      question.type === "choice" && selected !== null
        ? selected
        : text.trim();
    if (!val) return;
    onAnswer(question.id, val);
    setSelected(null);
    setText("");
  };

  return (
    <div className="bg-[#0d1526] border border-amber-400/20 rounded-2xl p-4 shadow-lg shadow-amber-400/5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={14} className="text-amber-400" />
          <span className="text-xs text-amber-400 font-medium">
            Question {index + 1} of {total}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1 w-5 rounded-full transition-all ${
                i < index
                  ? "bg-amber-400"
                  : i === index
                  ? "bg-amber-400/70"
                  : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question text */}
      <p className="text-white text-sm font-medium mb-1 leading-snug">{question.text}</p>
      {question.text_hi && (
        <p className="text-white/40 text-xs mb-1 italic">{question.text_hi}</p>
      )}
      {question.legal_relevance && (
        <p className="text-white/30 text-xs mb-3 italic">
          Why this matters: {question.legal_relevance}
        </p>
      )}

      {/* Text / Date / Number input */}
      {["text", "date", "number"].includes(question.type) && (
        <div className="flex gap-2">
          <input
            type={question.type === "date" ? "date" : question.type === "number" ? "number" : "text"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              question.type === "number"
                ? "Enter a number..."
                : question.type === "date"
                ? ""
                : "Type your answer..."
            }
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-amber-400 text-black text-sm font-bold px-4 rounded-xl hover:bg-amber-300 disabled:opacity-30 transition-all"
          >
            Next →
          </button>
        </div>
      )}

      {/* Choice (single-select) */}
      {question.type === "choice" && question.choices?.length > 0 && (
        <div className="space-y-2">
          {question.choices.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                setSelected(opt);
                // Auto-submit for choice type
                onAnswer(question.id, opt);
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all ${
                selected === opt
                  ? "bg-amber-400/15 border-amber-400/50 text-amber-300"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Fallback: text input if type is unrecognized */}
      {!["text", "date", "number", "choice"].includes(question.type) && (
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-all"
          />
          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bg-amber-400 text-black text-sm font-bold px-4 rounded-xl hover:bg-amber-300 disabled:opacity-30 transition-all"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
