import { useNavigate } from "react-router-dom";
import { Scale, ShieldCheck, Zap, ArrowRight } from "lucide-react";

const FEATURES = [
  { icon: <Scale size={22} />, title: "India-Specific Laws", desc: "IPC, Consumer Act, Labour Law, IT Act and more" },
  { icon: <ShieldCheck size={22} />, title: "Secure & Private", desc: "Your case details are encrypted and never shared" },
  { icon: <Zap size={22} />, title: "Instant Documents", desc: "Legal notices, complaints, FIR drafts in minutes" },
];

const SCENARIOS = [
  "Employer hasn't paid salary for 3 months",
  "Landlord refusing to return security deposit",
  "Got cheated in an online scam",
  "Received a fake legal notice",
  "Consumer product damaged without refund",
];

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-inter">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Scale size={24} className="text-amber-400" />
          <span className="font-bold text-lg tracking-tight">NyayAI</span>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const token = localStorage.getItem("token");
              navigate(token ? "/history" : "/login");
            }}
            className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
          >
            History
          </button>
          <button
            onClick={() => navigate("/chat")}
            className="text-sm bg-amber-400 text-black font-semibold px-4 py-2 rounded-xl hover:bg-amber-300 transition-all"
          >
            Get Help Now
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center px-6 pt-20 pb-12">
        <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Free legal guidance for every Indian
        </div>
        <h1 className="text-5xl font-bold leading-tight mb-5">
          Your AI Legal Assistant,<br />
          <span className="text-amber-400">in Hindi, English, or both.</span>
        </h1>
        <p className="text-white/60 text-lg mb-8">
          Describe your problem in plain language. NyayAI classifies your issue,
          asks the right questions, and drafts legal documents — instantly.
        </p>
        <button
          onClick={() => navigate("/chat")}
          className="inline-flex items-center gap-2 bg-amber-400 text-black font-bold text-base px-8 py-4 rounded-2xl hover:bg-amber-300 hover:scale-105 transition-all shadow-lg shadow-amber-400/20"
        >
          Describe your problem <ArrowRight size={18} />
        </button>
        <p className="text-white/30 text-xs mt-3">No registration needed · Hinglish supported</p>
      </div>

      {/* Scenarios */}
      <div className="max-w-2xl mx-auto px-6 pb-12">
        <p className="text-center text-white/40 text-sm mb-4">Try asking about...</p>
        <div className="flex flex-wrap justify-center gap-2">
          {SCENARIOS.map((s) => (
            <button
              key={s}
              onClick={() => navigate("/chat", { state: { prefill: s } })}
              className="text-sm bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-3xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
        {FEATURES.map((f) => (
          <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="text-amber-400 mb-3">{f.icon}</div>
            <h3 className="font-semibold mb-1">{f.title}</h3>
            <p className="text-white/50 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 text-center py-6 text-white/30 text-xs px-6">
        ⚠️ NyayAI provides legal information, not legal advice. Always consult a qualified advocate for your case.
        Free legal aid: <a href="https://nalsa.gov.in" className="underline hover:text-white/60" target="_blank" rel="noreferrer">nalsa.gov.in</a>
      </div>
    </div>
  );
}
