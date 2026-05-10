import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Clock, ChevronRight, Scale, AlertCircle } from "lucide-react";

export default function HistoryPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCases()
      .then(setCases)
      .catch((err) => {
          console.error(err);
          navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white font-inter">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">
              Case History
            </h1>
            <p className="text-white/40 text-sm mt-1">Manage your legal consultations</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="text-[10px] text-white/40 hover:text-red-400 px-3 py-1.5 transition-colors"
            >
              Logout
            </button>
            <button 
              onClick={() => navigate("/")}
              className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              New Case +
            </button>
          </div>
        </div>

        {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-6 text-center">
                <AlertCircle className="mx-auto text-red-400 mb-2" size={24} />
                <p className="text-red-400 text-sm">{error}</p>
                <button 
                    onClick={() => navigate("/")}
                    className="mt-4 text-xs bg-white/10 px-4 py-2 rounded-xl"
                >
                    Return Home
                </button>
            </div>
        )}

        {!error && cases.length === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <Scale className="mx-auto text-white/20 mb-4" size={48} />
            <p className="text-white/40">No cases found yet.</p>
            <button 
              onClick={() => navigate("/chat")}
              className="mt-6 bg-amber-400 text-black font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition-all"
            >
              Start First Consultation
            </button>
          </div>
        )}

        <div className="space-y-3">
          {cases.map((c) => (
            <div 
              key={c.id}
              onClick={() => navigate(`/summary/${c.id}`)}
              className="group bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white/90 group-hover:text-white transition-colors capitalize">
                    {c.primary_category.replace(/_/g, ' ')}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400/80">
                      {c.stage}
                    </span>
                    <span className="text-white/20">•</span>
                    <div className="flex items-center gap-1 text-white/30 text-[10px]">
                      <Clock size={10} />
                      {new Date(c.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              <ChevronRight className="text-white/20 group-hover:text-white/40 transition-all" size={20} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
