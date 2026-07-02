import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { APP_NAME } from "../../../constants";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
  };

  return (
    <div className="min-h-screen bg-prime-bg relative flex flex-col">
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&fit=crop"
          alt="" className="w-full h-full object-cover opacity-15" />
        <div className="absolute inset-0" style={{background:"linear-gradient(to bottom,rgba(15,23,30,0.5),#0F171E)"}} />
      </div>

      {/* Logo */}
      <div className="relative z-10 p-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm flex items-center justify-center" style={{background:"#00A8E1"}}>
            <span className="text-white font-bold text-sm">V</span>
          </div>
          <span className="text-white font-bold text-xl">{APP_NAME}</span>
        </Link>
      </div>

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16">
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.4}}
          className="w-full max-w-sm">
          <div className="bg-prime-surface border border-prime-border rounded-lg p-8 shadow-2xl">
            <h1 className="text-2xl font-bold text-white mb-1">Sign in</h1>
            <p className="text-prime-muted text-sm mb-6">Welcome back to {APP_NAME}</p>

            {error && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded px-3 py-2.5 mb-4">
                <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-prime-elevated border border-prime-border rounded px-3 py-2.5 text-white placeholder:text-prime-subtle text-sm focus:outline-none focus:border-prime-accent transition-colors" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-prime-muted uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showPass?"text":"password"} required value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-prime-elevated border border-prime-border rounded px-3 py-2.5 pr-10 text-white placeholder:text-prime-subtle text-sm focus:outline-none focus:border-prime-accent transition-colors" />
                  <button type="button" onClick={()=>setShowPass(v=>!v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-prime-muted hover:text-white transition-colors">
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded font-semibold text-sm text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{background:"#00A8E1"}}>
                {loading ? <><Loader2 size={16} className="animate-spin"/>Signing in...</> : "Sign in"}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-prime-border text-center">
              <p className="text-prime-muted text-sm">
                New to {APP_NAME}?{" "}
                <Link to="/register" className="text-prime-accent hover:underline font-medium">Create account</Link>
              </p>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
