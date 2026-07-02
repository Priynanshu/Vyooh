import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchVideos, selectVideos, selectVideoLoading } from "../features/video/videoSlice";
import ContentCard from "../features/video/components/ContentCard";
import { SkeletonCard } from "../features/video/components/SkeletonCard";
import { GENRES, CONTENT_TYPES } from "../constants";

export default function Browse() {
  const dispatch = useDispatch();
  const videos   = useSelector(selectVideos);
  const loading  = useSelector(selectVideoLoading);
  const [searchParams, setSearchParams] = useSearchParams();
  const [genre, setGenre] = useState("All");
  const typeFilter = searchParams.get("type") || "all";

  useEffect(() => { dispatch(fetchVideos({ page:1, limit:100 })); }, [dispatch]);

  const filtered = useMemo(() => videos.filter(v => {
    const tOk = typeFilter === "all" || v.type === typeFilter;
    const gOk = genre === "All" || v.genres?.includes(genre);
    return tOk && gOk;
  }), [videos, typeFilter, genre]);

  const setType = (t) => {
    const p = new URLSearchParams(searchParams);
    if (t === "all") p.delete("type"); else p.set("type", t);
    setSearchParams(p);
  };

  const title = typeFilter==="movie" ? "Movies" : typeFilter==="series" ? "Web Series" : "Browse All";

  return (
    <div className="min-h-screen bg-prime-bg pt-20 pb-16 px-4 sm:px-6 lg:px-10">
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:0.3}}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{title}</h1>

        {/* Type tabs */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {CONTENT_TYPES.map(ct => (
            <button key={ct.value} onClick={() => setType(ct.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                typeFilter===ct.value
                  ? "text-white border-prime-accent"
                  : "border-prime-border text-prime-muted hover:border-prime-muted hover:text-white"}`}
              style={typeFilter===ct.value?{background:"#00A8E1"}:{}}>
              {ct.label}
            </button>
          ))}
        </div>

        {/* Genre chips */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {["All",...GENRES].map(g => (
            <button key={g} onClick={() => setGenre(g)}
              className={`flex-shrink-0 px-3 py-1 rounded-sm text-xs font-medium border transition-all ${
                genre===g
                  ? "border-white text-white bg-prime-elevated"
                  : "border-prime-border text-prime-muted hover:border-prime-subtle hover:text-white"}`}>
              {g}
            </button>
          ))}
        </div>

        {/* Grid */}
{/* Grid */}
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
  {loading
    ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
    : filtered.map((video, i) => (
        <motion.div 
          key={video._id} 
          initial={{ opacity: 0, y: 8 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }} 
          className="w-full"
        >
          {/* YAHAN PAR isGrid={true} PASS KARNA ZAROORI HAI */}
          <ContentCard video={video} isGrid={true} />
        </motion.div>
      ))}
</div>

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-prime-muted text-sm">Is filter mein koi content nahi mila.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
