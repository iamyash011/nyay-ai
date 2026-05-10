import ReactMarkdown from "react-markdown";
import { AlertTriangle, Zap, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ClassificationMeta({ meta }) {
  const urgencyColor = {
    low: "text-green-400 bg-green-400/10 border-green-400/30",
    medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
    high: "text-orange-400 bg-orange-400/10 border-orange-400/30",
    critical: "text-red-400 bg-red-400/10 border-red-400/30",
  }[meta.urgency] || "text-white/50";

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium border px-2 py-0.5 rounded-full ${urgencyColor}`}>
          {meta.urgency?.toUpperCase()} URGENCY
        </span>
        <span className="text-xs text-white/40">
          Confidence: {Math.round((meta.confidence || 0) * 100)}%
        </span>
      </div>
      {meta.laws?.length > 0 && (
        <div className="flex items-start gap-2">
          <BookOpen size={13} className="text-amber-400 mt-0.5 shrink-0" />
          <p className="text-xs text-white/50 leading-relaxed">
            {meta.laws.slice(0, 2).join(" · ")}
          </p>
        </div>
      )}
    </div>
  );
}

function DocumentReadyCard({ meta }) {
  const navigate = useNavigate();
  return (
    <div className="mt-3 flex gap-2">
      <button
        onClick={() => navigate(`/document/${meta.documentId}`)}
        className="flex-1 bg-amber-400 text-black text-sm font-bold py-2.5 rounded-xl hover:bg-amber-300 transition-all"
      >
        View Document
      </button>
      <button
        onClick={() => navigate(`/summary/${meta.caseId}`)}
        className="flex-1 bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-white/20 transition-all border border-white/10"
      >
        Next Steps →
      </button>
    </div>
  );
}

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-amber-400 text-black rounded-2xl rounded-tr-sm px-4 py-3 text-sm font-medium shadow-lg shadow-amber-400/10">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3 max-w-[85%]">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 text-xs font-bold text-black mt-1">
        N
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-white/85 leading-relaxed shadow-sm">
        <ReactMarkdown
          components={{
            strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
            p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
          }}
        >
          {message.content}
        </ReactMarkdown>

        {message.type === "classification" && message.meta && (
          <ClassificationMeta meta={message.meta} />
        )}
        {message.type === "document_ready" && message.meta && (
          <DocumentReadyCard meta={message.meta} />
        )}
      </div>
    </div>
  );
}
