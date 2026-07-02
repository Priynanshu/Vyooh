import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { fetchVideos, selectVideos, selectVideoLoading } from "../features/video/videoSlice";
import ContentCard from "../features/video/components/ContentCard";
import { SkeletonCard } from "../features/video/components/SkeletonCard";

export default function Search() {
  const dispatch = useDispatch();
  const videos   = useSelector(selectVideos);
  const loading  = useSelector(selectVideoLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    if (!videos.length) dispatch(fetchVideos({ page:1, limit:100 }));
  }, [dispatch]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return videos.filter(v =>
      v.title?.toLowerCase().includes(q) ||
      v.genres?.some(g => g.toLowerCase().includes(q)) ||
      v.type?.toLowerCase().includes(q)
    );
  }, [query, videos]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSearchParams(val ? { q: val } : {});
  };

  return (
    <div className="min-h-screen bg-prime-bg pt-20 pb-16 px-4 sm:px-6 lg:px-10">
      {/* Search input */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-prime-muted"/>
          <input autoFocus value={query} onChange={handleChange}
            placeholder="Titles, genres ya type search karein..."
            className="w-full bg-prime-surface border border-prime-border rounded pl-10 pr-10 py-3 text-white placeholder:text-prime-subtle text-sm focus:outline-none focus:border-prime-accent transition-colors"/>
          {query && (
            <button onClick={() => { setQuery(""); setSearchParams({}); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-prime-muted hover:text-white transition-colors">
              <X size={16}/>
            </button>
          )}
        </div>
      </div>

      {query.trim() === "" ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <SearchIcon size={40} className="text-prime-muted mb-4"/>
          <p className="text-prime-muted text-sm">Kuch type karein search karne ke liye</p>
        </div>
      ) : (
        <>
          {!loading && (
            <p className="text-prime-muted text-sm mb-4">
              {results.length > 0
                ? `${results.length} result${results.length>1?"s":""} for "${query}"`
                : `"${query}" ke liye koi result nahi mila`}
            </p>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {loading
              ? Array.from({length:8}).map((_,i) => <SkeletonCard key={i}/>)
              : results.map((video, i) => (
                  <motion.div key={video._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                    transition={{delay:i*0.03}} className="w-full">
                    <ContentCard video={video}/>
                  </motion.div>
                ))}
          </div>
        </>
      )}
    </div>
  );
}
