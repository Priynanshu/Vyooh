import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, ThumbsUp, Info, Youtube } from "lucide-react";

function getThumbnail(video) {
  if (video.source === "youtube" && video.videoId)
    return `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
  if (video.thumbnail) return video.thumbnail;
  return "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&fit=crop";
}

export default function ContentCard({ video, size = "md", isGrid = false }) {
  const [hovered, setHovered] = useState(false);
  
  // Amazon Prime Style Bada Size (Agar horizontal scroll list me use karein tab)
  const widths = { 
    sm: "w-52 sm:w-56", 
    md: "w-64 sm:w-72 lg:w-80", // Increased card size
    lg: "w-72 sm:w-80 lg:w-96" 
  };

  const watchUrl = video.source === "youtube"
    ? `/watch-yt/${video._id}`
    : `/watch/${video._id}`;

  return (
    <div 
      className={`${isGrid ? "w-full" : widths[size]} flex-shrink-0 group relative`}
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/title/${video._id}`}>
        {/* Amazon Prime uses rounded-md corners for premium look */}
        <div className="relative rounded-md overflow-hidden aspect-video bg-prime-elevated cursor-pointer shadow-md group-hover:shadow-xl transition-shadow duration-300">
          <img 
            src={getThumbnail(video)} 
            alt={video.title} 
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600"; }}
          />

          {video.source === "youtube" && (
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 rounded px-2 py-0.5 z-10">
              <Youtube size={12} className="text-red-500" />
              <span className="text-[10px] text-white font-medium">YouTube</span>
            </div>
          )}

          {video.status && video.status !== "ready" && video.status !== "published" && (
            <div className="absolute top-2 right-2 bg-yellow-500/90 text-black text-[10px] font-bold px-2 py-0.5 rounded capitalize z-10">
              {video.status}
            </div>
          )}

          <AnimatePresence>
            {hovered && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex flex-col justify-end p-3"
                style={{ background: "linear-gradient(to top, rgba(15,23,30,0.98) 0%, rgba(15,23,30,0.7) 60%, transparent 100%)" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Link 
                    to={watchUrl} 
                    onClick={e => e.stopPropagation()}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-prime-bg hover:scale-110 transition-transform"
                    style={{ background: "white" }} 
                    aria-label="Play"
                  >
                    <Play size={14} fill="currentColor" />
                  </Link>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white hover:bg-white/10 transition-colors" aria-label="Add">
                    <Plus size={15} />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white hover:bg-white/10 transition-colors" aria-label="Like">
                    <ThumbsUp size={14} />
                  </button>
                  <Link 
                    to={`/title/${video._id}`} 
                    onClick={e => e.stopPropagation()}
                    className="ml-auto w-8 h-8 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white hover:bg-white/10 transition-colors" 
                    aria-label="More info"
                  >
                    <Info size={14} />
                  </Link>
                </div>
                
                <p className="text-white text-sm font-bold truncate">{video.title}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-prime-accent text-[11px] font-semibold uppercase">{video.type}</span>
                  {video.genres?.[0] && <span className="text-prime-muted text-[11px]">· {video.genres[0]}</span>}
                  {video.year && <span className="text-prime-muted text-[11px]">· {video.year}</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
      
      {/* Title niche tabhi dikhega jab hover na ho prime content styles ki tarah */}
      <p className="mt-2 text-sm font-medium text-prime-muted truncate group-hover:text-white transition-colors px-0.5">
        {video.title}
      </p>
    </div>
  );
}