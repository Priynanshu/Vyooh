import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Mail, Shield, Clock, Film, History, Check } from "lucide-react";
import { useAuth } from "../features/auth/hooks/useAuth";
import api from "../services/api";
import { API } from "../constants";
import { useEffect } from "react";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await api.get(API.HISTORY_GET);
        setHistory(res.data.data || []);
      } catch (_) {}
      finally { setHistLoading(false); }
    }
    loadHistory();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const avatar = user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-prime-bg pt-20 pb-16 px-4 sm:px-6 lg:px-10">
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.4}}>

        {/* Profile header */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{background:"#00A8E1"}}>
            {avatar}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
            <p className="text-prime-muted text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-sm capitalize ${
              user?.role === "admin" ? "bg-prime-accent/20 text-prime-accent" : "bg-prime-elevated text-prime-muted"}`}>
              {user?.role || "user"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account info */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-prime-muted uppercase tracking-wider mb-3">Account</h2>

            <div className="bg-prime-surface border border-prime-border rounded p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User size={16} className="text-prime-muted flex-shrink-0"/>
                <div>
                  <p className="text-xs text-prime-muted">Username</p>
                  <p className="text-white text-sm font-medium">{user?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-prime-muted flex-shrink-0"/>
                <div>
                  <p className="text-xs text-prime-muted">Email</p>
                  <p className="text-white text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={16} className="text-prime-muted flex-shrink-0"/>
                <div>
                  <p className="text-xs text-prime-muted">Role</p>
                  <p className="text-white text-sm font-medium capitalize">{user?.role || "user"}</p>
                </div>
              </div>
            </div>

            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-colors">
              <LogOut size={16}/> Sign out
            </button>
          </div>

          {/* Watch history */}
          <div className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-prime-muted uppercase tracking-wider mb-3">Watch History</h2>

            <div className="bg-prime-surface border border-prime-border rounded overflow-hidden">
              {histLoading ? (
                <div className="p-8 flex justify-center">
                  <div className="w-5 h-5 border-2 border-prime-accent border-t-transparent rounded-full animate-spin"/>
                </div>
              ) : history.length === 0 ? (
                <div className="p-8 text-center">
                  <History size={28} className="text-prime-muted mx-auto mb-3"/>
                  <p className="text-prime-muted text-sm">Koi watch history nahi abhi.</p>
                  <p className="text-prime-subtle text-xs mt-1">Videos dekhna shuru karein!</p>
                </div>
              ) : (
                <div className="divide-y divide-prime-border">
                  {history.map((item) => {
                    const v = item.video;
                    if (!v) return null;
                    const thumb = v.thumbnail || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300";
                    return (
                      <div key={item._id} className="flex items-center gap-3 p-3 hover:bg-prime-elevated/50 transition-colors">
                        <div className="w-20 h-12 rounded overflow-hidden bg-prime-elevated flex-shrink-0 relative">
                          <img src={thumb} alt={v.title} className="w-full h-full object-cover"/>
                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                            <div className="h-full bg-prime-accent" style={{width:`${item.progress||0}%`}}/>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{v.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-prime-muted text-xs capitalize">{v.type}</span>
                            <span className="text-prime-subtle text-xs">·</span>
                            <span className="text-prime-muted text-xs">{item.progress || 0}% watched</span>
                            {item.completed && (
                              <span className="text-green-400 text-xs flex items-center gap-0.5">
                                <Check size={10}/> Done
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-prime-subtle text-xs flex-shrink-0">
                          <Clock size={11}/>
                          <span>{new Date(item.lastWatchedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
