import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Copy, Download, ArrowRight, Scale, CheckCircle } from "lucide-react";

export default function DocumentPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!documentId) {
      setError("No document ID provided.");
      setLoading(false);
      return;
    }
    api
      .getDocument(documentId)
      .then(setDoc)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [documentId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(doc?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([doc?.content || ""], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc?.document_title || "legal-document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Loading your legal document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-red-400 font-semibold">Failed to load document</p>
          <p className="text-white/40 text-sm">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-white/70 hover:bg-white/20 transition-all"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const caseId = doc?.case_id;

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-inter">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1526]/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Scale size={18} className="text-amber-400" />
          <span className="font-bold text-sm">NyayAI — Document</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all"
          >
            {copied ? <CheckCircle size={13} className="text-green-400" /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 text-xs bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all"
          >
            <Download size={13} />
            Download
          </button>
          {caseId && (
            <button
              onClick={() => navigate(`/summary/${caseId}`)}
              className="flex items-center gap-1.5 text-xs bg-amber-400 text-black font-bold px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-all"
            >
              Next Steps <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-1">{doc?.document_title}</h1>
        <p className="text-white/40 text-sm mb-2">
          AI-generated draft · Review before sending
        </p>
        <p className="text-white/30 text-xs mb-6">
          Type: {doc?.document_type?.replace(/_/g, " ")}
        </p>

        {/* Document body */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 font-mono text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
          {doc?.content || "Document content not available."}
        </div>

        {/* Metadata */}
        {doc?.metadata && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {doc.metadata.jurisdiction && (
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-sm">
                <span className="text-white/50 text-xs block mb-1">Jurisdiction</span>
                <span className="text-white/80">{doc.metadata.jurisdiction}</span>
              </div>
            )}
            {doc.metadata.estimated_relief && (
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-sm">
                <span className="text-white/50 text-xs block mb-1">Estimated Relief</span>
                <span className="text-white/80">{doc.metadata.estimated_relief}</span>
              </div>
            )}
            {doc.metadata.next_action && (
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-sm col-span-full">
                <span className="text-white/50 text-xs block mb-1">Next Action</span>
                <span className="text-white/80">{doc.metadata.next_action}</span>
              </div>
            )}
            {doc.metadata.acts_cited?.length > 0 && (
              <div className="p-4 bg-white/3 border border-white/8 rounded-xl text-sm col-span-full">
                <span className="text-white/50 text-xs block mb-1">Acts Cited</span>
                <span className="text-white/80">{doc.metadata.acts_cited.join(", ")}</span>
              </div>
            )}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-amber-400/5 border border-amber-400/20 rounded-xl text-xs text-amber-300/70 leading-relaxed">
          ⚠️ This is an AI-generated draft for informational purposes only. Review carefully and consult a qualified advocate before sending. NyayAI does not provide legal advice.
        </div>
      </div>
    </div>
  );
}
