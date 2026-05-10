import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { ShieldCheck, ListChecks, AlertTriangle, Scale, ExternalLink, Phone, Globe, MessageCircle, Send, Home } from "lucide-react";

const RiskBadge = ({ level }) => {
  const styles = {
    low: "bg-green-400/15 text-green-400 border-green-400/30",
    medium: "bg-yellow-400/15 text-yellow-400 border-yellow-400/30",
    high: "bg-red-400/15 text-red-400 border-red-400/30",
    critical: "bg-red-600/15 text-red-400 border-red-600/30",
  };
  return (
    <span className={`text-xs font-bold border px-2.5 py-1 rounded-full ${styles[level] || styles.medium}`}>
      {level?.toUpperCase()} RISK
    </span>
  );
};

export default function SummaryPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [explain, setExplain] = useState(null);
  const [steps, setSteps] = useState(null);
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("explain");
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
    // Fetch case data for history
    api.getCase(caseId).then(setCaseData).catch(console.error);
  }, [caseId]);

  // Sync chat history from caseData
  useEffect(() => {
    if (caseData?.chat_history) {
      setChat(caseData.chat_history);
    }
  }, [caseData]);

  useEffect(() => {
    Promise.all([
      api.explain(caseId),
      api.nextSteps(caseId),
      api.riskAnalysis(caseId),
    ])
      .then(([e, s, r]) => {
        setExplain(e);
        setSteps(s);
        setRisk(r);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [caseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-white/50 text-sm">Analysing your case...</p>
          <p className="text-white/30 text-xs">Running 3 AI analyses in parallel</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-6">
          <p className="text-red-400 font-semibold">Analysis failed</p>
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

  const TABS = [
    { id: "explain", label: "Explanation", icon: <Scale size={14} /> },
    { id: "steps", label: "Next Steps", icon: <ListChecks size={14} /> },
    { id: "risk", label: "Risk Analysis", icon: <ShieldCheck size={14} /> },
    { id: "chat", label: "Chat", icon: <MessageCircle size={14} /> },
  ];

  const handleSend = async () => {
    if (!message.trim() || chatLoading) return;
    const userMsg = message;
    setMessage("");
    setChat(prev => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);
    try {
      const res = await api.followUp(caseId, userMsg);
      setChat(prev => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      console.error(err);
      setChat(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-inter">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col mb-6">
          <div className="flex items-center gap-3">
            <button
                onClick={() => navigate(-1)}
                className="text-white/40 hover:text-white/80 transition-colors text-sm"
            >
                ←
            </button>
            <div className="flex items-center gap-2">
                <button
                onClick={() => navigate("/")}
                className="text-white/40 hover:text-white/80 transition-colors"
                title="Return to Home"
                >
                <Home size={18} />
                </button>
                <div className="w-px h-4 bg-white/10 mx-1" />
                <h1 className="text-2xl font-bold">Case Summary</h1>
            </div>
          </div>
          <p className="text-white/40 text-sm mt-1 ml-9">Understanding your legal position</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 text-sm py-2 rounded-lg font-medium transition-all ${
                activeTab === t.id
                  ? "bg-amber-400 text-black"
                  : "text-white/50 hover:text-white"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Explain Tab ── */}
        {activeTab === "explain" && explain && (
          <div className="space-y-4">
            {/* Plain summary */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
                {explain.plain_summary}
              </p>
            </div>

            {/* Hindi summary if present */}
            {explain.plain_summary_hi && (
              <div className="bg-white/3 border border-white/8 rounded-2xl p-5">
                <p className="text-xs text-amber-400/60 mb-2 font-medium">हिंदी में</p>
                <p className="text-white/60 leading-relaxed text-sm">
                  {explain.plain_summary_hi}
                </p>
              </div>
            )}

            <Section title="Your Rights" items={explain.your_rights} color="green" />
            <Section title="Legal Interpretation" items={[explain.what_happened_legally]} color="blue" />

            {/* Key legal terms */}
            {explain.key_terms?.length > 0 && (
              <div className="border border-white/10 rounded-2xl p-4 bg-white/3">
                <p className="font-semibold text-sm mb-3">Key Legal Terms</p>
                <div className="space-y-2">
                  {explain.key_terms.map((kt, i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <span className="text-amber-400 font-medium shrink-0">{kt.term}:</span>
                      <span className="text-white/60">{kt.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Next Steps Tab ── */}
        {activeTab === "steps" && steps && (
          <div className="space-y-4">
            {steps.immediate_actions?.map((a, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-400 text-black text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white mb-0.5">{a.step}</p>
                    <p className="text-xs text-amber-400 mb-2">⏰ {a.deadline}</p>
                    <p className="text-sm text-white/60">{a.why}</p>
                  </div>
                </div>
              </div>
            ))}

            {steps.documents_to_collect?.length > 0 && (
              <div className="border border-blue-400/20 bg-blue-400/5 rounded-2xl p-4">
                <p className="font-semibold text-sm text-blue-300 mb-2">📂 Documents to Collect</p>
                <ul className="space-y-1">
                  {steps.documents_to_collect.map((doc, i) => (
                    <li key={i} className="text-sm text-blue-300/80 flex gap-2">
                      <span className="shrink-0">·</span>{doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {steps.authorities_to_approach?.length > 0 && (
              <div className="border border-white/10 bg-white/3 rounded-2xl p-4">
                <p className="font-semibold text-sm mb-3">🏛️ Authorities to Approach</p>
                <div className="space-y-3">
                  {steps.authorities_to_approach.map((auth, i) => (
                    <div key={i} className="text-sm">
                      <p className="text-white font-medium">{auth.name}</p>
                      <p className="text-white/50 text-xs">{auth.for}</p>
                      <div className="flex gap-3 mt-1">
                        {auth.url && (
                          <a
                            href={auth.url.startsWith("http") ? auth.url : `https://${auth.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-400 transition-colors"
                          >
                            <Globe size={10} /> {auth.url}
                          </a>
                        )}
                        {auth.helpline && (
                          <span className="flex items-center gap-1 text-xs text-white/40">
                            <Phone size={10} /> {auth.helpline}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {steps.estimated_timeline && (
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl text-sm">
                  <p className="text-white/40 text-xs mb-1">Timeline</p>
                  <p className="text-white/80">{steps.estimated_timeline}</p>
                </div>
              )}
              {steps.cost_estimate && (
                <div className="p-3 bg-white/3 border border-white/8 rounded-xl text-sm">
                  <p className="text-white/40 text-xs mb-1">Estimated Cost</p>
                  <p className="text-white/80">{steps.cost_estimate}</p>
                </div>
              )}
            </div>

            {steps.helplines?.length > 0 && (
              <div className="border border-white/8 bg-white/3 rounded-2xl p-4">
                <p className="font-semibold text-sm mb-2 text-white/70">📞 Helplines</p>
                <div className="space-y-2">
                  {steps.helplines.map((h, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="text-white/80">{h.name}</span>
                        {h.for && <span className="text-white/40 text-xs ml-2">— {h.for}</span>}
                      </div>
                      <span className="text-amber-400 font-mono">{h.number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Risk Tab ── */}
        {activeTab === "risk" && risk && (
          <div className="space-y-4">
            {/* Score card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/50 text-sm mb-1">Case Strength</p>
                  <p className="text-3xl font-bold">{risk.case_strength}<span className="text-lg text-white/40">/100</span></p>
                </div>
                <div className="text-right">
                  <RiskBadge level={risk.overall_risk} />
                  <p className="text-white/40 text-xs mt-2">
                    AI Confidence: {Math.round((risk.confidence_score || 0) * 100)}%
                  </p>
                </div>
              </div>

              {/* Strength bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all"
                  style={{ width: `${risk.case_strength || 0}%` }}
                />
              </div>
            </div>

            <Section title="✅ Strengths" items={risk.strengths} color="green" />
            <Section title="⚠️ Weaknesses" items={risk.weaknesses} color="red" />
            <Section title="🔍 Risk Factors" items={risk.risk_factors} color="orange" />

            {risk.limitation_warning && (
              <div className="p-4 bg-red-400/5 border border-red-400/20 rounded-2xl text-sm text-red-300">
                <p className="font-semibold mb-1">⏰ Limitation Warning</p>
                <p className="text-red-300/80">{risk.limitation_warning}</p>
              </div>
            )}

            {risk.recommended_action && (
              <div className="p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl text-sm">
                <p className="text-white/50 text-xs mb-1">Recommended Action</p>
                <p className="text-amber-300 font-semibold capitalize">
                  {risk.recommended_action.replace(/_/g, " ")}
                </p>
              </div>
            )}

            <div className="text-xs text-amber-300/60 bg-amber-400/5 border border-amber-400/15 rounded-xl p-4">
              ⚠️ {risk.legal_disclaimer}
            </div>
          </div>
        )}
        
        {/* ── Chat Tab ── */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-[500px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chat.length === 0 && (
                <div className="h-full flex items-center justify-center text-center px-8">
                  <p className="text-white/30 text-sm italic">
                    Ask me any follow-up questions about your case, specific laws, or next steps.
                  </p>
                </div>
              )}
              {chat.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.role === "user" 
                      ? "bg-amber-400 text-black font-medium" 
                      : "bg-white/10 text-white/90"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 px-4 py-2.5 rounded-2xl text-white/40 text-xs animate-pulse">
                    AI is thinking...
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your question..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400/50"
              />
              <button
                onClick={handleSend}
                disabled={chatLoading}
                className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center hover:bg-amber-300 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, color }) {
  const colors = {
    green: "bg-green-400/5 border-green-400/20 text-green-300",
    red: "bg-red-400/5 border-red-400/20 text-red-300",
    orange: "bg-orange-400/5 border-orange-400/20 text-orange-300",
    blue: "bg-blue-400/5 border-blue-400/20 text-blue-300",
  };
  if (!items?.length) return null;
  return (
    <div className={`border rounded-2xl p-4 ${colors[color]}`}>
      <p className="font-semibold text-sm mb-2">{title}</p>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm opacity-80 flex gap-2">
            <span className="mt-0.5 shrink-0">·</span>{item}
          </li>
        ))}
      </ul>
    </div>
  );
}
