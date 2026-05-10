import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Scale, Mail, Lock, User, ArrowRight, AlertCircle } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: "", password: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const res = await api.login(formData.email, formData.password);
        localStorage.setItem("token", res.access);
        localStorage.setItem("refresh", res.refresh);
        navigate("/history");
      } else {
        await api.register({
          ...formData,
          username: formData.email,
          first_name: formData.full_name,
        });
        // After register, auto login
        const res = await api.login(formData.email, formData.password);
        localStorage.setItem("token", res.access);
        navigate("/history");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-400/10 text-amber-400 mb-4 border border-amber-400/20">
            <Scale size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">NyayAI</h1>
          <p className="text-white/40 text-sm mt-2">
            {isLogin ? "Welcome back, citizen." : "Join the legal revolution."}
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/50 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Arjun Sharma"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/50 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 p-4 rounded-2xl text-sm">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              disabled={loading}
              className="w-full bg-amber-400 text-black font-bold py-4 rounded-2xl hover:bg-amber-300 transition-all flex items-center justify-center gap-2 group shadow-lg shadow-amber-400/10"
            >
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-white/30">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-amber-400 font-bold hover:underline"
            >
              {isLogin ? "Register now" : "Login here"}
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          className="w-full mt-8 text-white/30 text-xs hover:text-white/60 transition-colors"
        >
          ← Return to homepage
        </button>
      </div>
    </div>
  );
}
