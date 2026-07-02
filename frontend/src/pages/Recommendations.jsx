import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, Play, Info } from "lucide-react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/auth/authSlice";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Recommendations() {
  const user = useSelector(selectUser);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  api.get("/api/recommendations")
    .then(res => {
      console.log("Recommendation response:", res.data); // yeh add karo
      setRecommendations(res.data.data);
    })
    .catch(err => {
      console.error("Recommendation error:", err.response?.data || err.message); // yeh bhi
      setRecommendations([]);
    })
    .finally(() => setLoading(false));
}, []);

  return (
    <div className="min-h-screen bg-prime-bg pt-20 pb-16 px-4 sm:px-6 lg:px-10">

      {loading ? (
  <div className="text-center py-12 text-prime-muted">Loading recommendations...</div>
) : recommendations.length === 0 ? (
  <div className="text-center py-12 text-prime-muted">
    Koi recommendations nahi mili — kuch videos dekho pehle.
  </div>
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {recommendations.map((rec, i) => (
          <motion.div
            key={rec._id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="group bg-prime-surface border border-prime-border rounded-prime overflow-hidden hover:border-prime-accent/40 transition-all hover:shadow-prime"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video overflow-hidden">
              <img
                src={rec.thumbnail}
                alt={rec.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600";
                }}
              />
              <div className="absolute inset-0 bg-card-fade opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Link to={rec.source === "youtube" ? `/watch-yt/${rec._id}` : `/watch/${rec._id}`} className="w-10 h-10 bg-prime-accent rounded-full flex items-center justify-center hover:bg-prime-accentLight transition-colors">
                  <Play size={18} fill="white" className="text-white ml-0.5" />
                </Link>
                <Link to={`/title/${rec._id}`} className="w-10 h-10 bg-prime-elevated/80 border border-prime-border rounded-full flex items-center justify-center">
                  <Info size={16} className="text-prime-text" />
                </Link>
              </div>
            </div>

            {/* Info */}
            <div className="p-3.5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className="text-prime-text font-semibold text-sm leading-tight line-clamp-1">
                  {rec.title}
                </h3>
                <span className="flex-shrink-0 text-[10px] font-bold uppercase text-prime-accent border border-prime-accent/40 px-1.5 py-0.5 rounded-sm">
                  {rec.type}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <span className="text-prime-muted text-xs">{rec.year}</span>
                {rec.genres?.slice(0, 2).map((g) => (
                  <span key={g} className="text-[10px] text-prime-subtle bg-prime-elevated px-1.5 py-0.5 rounded-sm">
                    {g}
                  </span>
                ))}
              </div>

              {/* AI reason */}
              <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-prime-border">
                <Sparkles size={11} className="text-prime-accent mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-prime-muted leading-relaxed">{rec.reason}</p>
              </div>
            </div>
          </motion.div>
        ))}
  </div>
)}

      {/* Dummy recommendation grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
      </div>
    </div>
  );
}
