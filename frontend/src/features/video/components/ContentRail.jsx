import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ContentCard from "./ContentCard";
import { SkeletonCard } from "./SkeletonCard";

export default function ContentRail({ title, videos = [], loading = false, size = "md", badge }) {
  const railRef = useRef(null);
  const [showLeft, setShowLeft]   = useState(false);
  const [showRight, setShowRight] = useState(true);

  const scroll = (dir) => {
    if (!railRef.current) return;
    const amount = railRef.current.clientWidth * 0.8;
    railRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setShowLeft(scrollLeft > 10);
    setShowRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const SKELETONS = Array.from({ length: 6 });

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4 }}
      className="mb-8 sm:mb-10"
    >
      {/* Title row */}
      <div className="flex items-center gap-3 mb-3 px-4 sm:px-6 lg:px-10">
        <h2 className="text-base sm:text-lg font-semibold text-prime-text">{title}</h2>
        {badge && (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-prime-accent text-white rounded-sm">
            {badge}
          </span>
        )}
      </div>

      {/* Rail container */}
      <div className="relative group/rail">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-10 hidden sm:flex items-center justify-center bg-gradient-to-r from-prime-bg to-transparent opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <div className="w-7 h-7 bg-prime-surface border border-prime-border rounded-full flex items-center justify-center hover:bg-prime-elevated transition-colors">
              <ChevronLeft size={16} className="text-prime-text" />
            </div>
          </button>
        )}

        {/* Scrollable content */}
        <div
          ref={railRef}
          onScroll={handleScroll}
          className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-6 lg:px-10 pb-2"
        >
          {loading
            ? SKELETONS.map((_, i) => <SkeletonCard key={i} size={size} />)
            : videos.map((video) => (
                <ContentCard key={video._id} video={video} size={size} />
              ))}
        </div>

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-10 hidden sm:flex items-center justify-center bg-gradient-to-l from-prime-bg to-transparent opacity-0 group-hover/rail:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <div className="w-7 h-7 bg-prime-surface border border-prime-border rounded-full flex items-center justify-center hover:bg-prime-elevated transition-colors">
              <ChevronRight size={16} className="text-prime-text" />
            </div>
          </button>
        )}
      </div>
    </motion.section>
  );
}
