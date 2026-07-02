import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Volume2, VolumeX, Star } from "lucide-react";

function getThumbnail(video) {
  if (video.source === "youtube" && video.videoId) {
    return `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
  }
  return video.thumbnail ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1920&auto=format&fit=crop";
}

function HeroSkeleton() {
  return (
    <div className="relative h-[56vw] max-h-[80vh] min-h-[400px] w-full bg-prime-surface skeleton" />
  );
}

export default function HeroBanner({ videos = [], loading = false }) {
  const [index, setIndex]   = useState(0);
  const [muted, setMuted]   = useState(true);
  const featured = videos.filter((v) => v.status === "ready").slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (loading) return <HeroSkeleton />;
  if (!featured.length) return null;

  const video = featured[index];

  return (
    <section className="relative h-[56vw] max-h-[85vh] min-h-[420px] w-full overflow-hidden bg-[#0f171e]">
      <div className="absolute inset-0 w-full h-full">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={video._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Image position and size kept exactly like your original layout */}
            <img
              src={getThumbnail(video)}
              alt={video.title}
              className="absolute inset-0 w-full h-full object-cover z-0" 
            />
            
            {/* FIX: Multi-layered gradients to blend the full-screen image seamlessly.
              Layer 1: Left to Right deep blend that covers the center text area completely 
            */}
            <div 
              className="absolute inset-0 z-10" 
              style={{
                background: "linear-gradient(to right, #0f171e 25%, rgba(15, 23, 30, 0.85) 45%, rgba(15, 23, 30, 0.4) 70%, transparent 100%)"
              }} 
            />

            {/* Layer 2: Bottom to Top blend to smoothly merge with the lower sections/cards */}
            <div 
              className="absolute inset-0 z-10" 
              style={{
                background: "linear-gradient(to top, #0f171e 0%, rgba(15, 23, 30, 0.5) 25%, transparent 60%)"
              }} 
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Layout */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${video._id}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-[15%] left-0 px-4 sm:px-6 lg:px-10 max-w-xl z-20"
        >
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-prime-accent border border-prime-accent/50 px-2 py-0.5 rounded-sm">
              {video.type === "series" ? "Series" : "Movie"}
            </span>
            {video.genres?.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-prime-muted">{g}</span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
            {video.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-4 text-sm text-prime-muted">
            {video.year && <span>{video.year}</span>}
            {video.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={13} className="text-prime-warning fill-prime-warning" />
                <span>{video.rating}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {video.description && (
            <p className="text-prime-muted text-sm sm:text-base leading-relaxed mb-5 line-clamp-2 max-w-md">
              {video.description}
            </p>
          )}

          {/* CTA buttons */}
          <div className="flex items-center gap-3">
            <Link
              to={video.source === "youtube" ? `/watch-yt/${video._id}` : `/watch/${video._id}`}
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 text-white font-semibold rounded text-sm transition-all"
              style={{ background: "#00A8E1" }}
            >
              <Play size={18} fill="white" />
              Watch now
            </Link>
            <Link
              to={`/title/${video._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded text-sm transition-colors border border-white/30 backdrop-blur-sm"
            >
              <Info size={16} />
              Details
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mute button */}
      <button
        onClick={() => setMuted((v) => !v)}
        className="absolute bottom-[17%] right-4 sm:right-10 w-9 h-9 flex items-center justify-center border border-white/20 rounded-full text-prime-muted hover:text-white bg-black/30 backdrop-blur-sm transition-colors z-20"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Dot indicators */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === index ? "w-6 h-1.5" : "w-1.5 h-1.5 bg-white/40 hover:bg-white"
              }`}
              style={i === index ? { background: "#00A8E1" } : {}}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}