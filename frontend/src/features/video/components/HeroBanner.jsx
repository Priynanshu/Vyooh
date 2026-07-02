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

  // Auto-cycle every 7 seconds
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
    <section className="relative h-[56vw] max-h-[80vh] min-h-[400px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={video._id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={getThumbnail(video)}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          {/* Prime Video exact gradients */}
          <div className="absolute inset-0 bg-hero-fade" />
          <div className="absolute inset-0 bg-hero-bottom" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`content-${video._id}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute bottom-[12%] left-0 px-4 sm:px-6 lg:px-10 max-w-xl"
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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-prime-text leading-tight mb-3 drop-shadow-lg">
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
              className="inline-flex items-center gap-2 px-5 sm:px-7 py-2.5 bg-prime-accent hover:bg-prime-accentLight text-white font-semibold rounded-prime text-sm transition-all shadow-prime hover:shadow-prime-hover"
            >
              <Play size={18} fill="white" />
              Watch now
            </Link>
            <Link
              to={`/title/${video._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-prime-elevated/70 hover:bg-prime-elevated text-prime-text font-medium rounded-prime text-sm transition-colors border border-prime-border backdrop-blur-sm"
            >
              <Info size={16} />
              Details
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Mute button — Prime style */}
      <button
        onClick={() => setMuted((v) => !v)}
        className="absolute bottom-[14%] right-4 sm:right-10 w-9 h-9 flex items-center justify-center border border-prime-muted/50 rounded-full text-prime-muted hover:text-prime-text hover:border-prime-text bg-prime-bg/30 backdrop-blur-sm transition-colors"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      {/* Dot indicators — agar multiple featured videos hain */}
      {featured.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === index
                  ? "w-6 h-1.5 bg-prime-accent"
                  : "w-1.5 h-1.5 bg-prime-muted/50 hover:bg-prime-muted"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
