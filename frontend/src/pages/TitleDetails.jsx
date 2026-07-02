import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Play, Plus, ThumbsUp, Share2, Youtube, Calendar, Tag } from "lucide-react";
import { fetchVideoById, selectCurrentVideo, selectVideoLoading, clearCurrentVideo } from "../features/video/videoSlice";

function getThumbnail(v) {
  if (!v) return "";
  if (v.source==="youtube" && v.videoId) return `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`;
  return v.thumbnail || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920";
}

export default function TitleDetails() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const video    = useSelector(selectCurrentVideo);
  const loading  = useSelector(selectVideoLoading);

  useEffect(() => {
    dispatch(fetchVideoById(id));
    return () => dispatch(clearCurrentVideo());
  }, [id, dispatch]);

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-prime-bg pt-14">
        <div className="h-[50vw] max-h-[65vh] skeleton"/>
        <div className="px-4 sm:px-6 lg:px-10 mt-6 space-y-3">
          <div className="h-8 w-64 rounded skeleton"/>
          <div className="h-4 w-48 rounded skeleton"/>
          <div className="h-20 rounded skeleton"/>
        </div>
      </div>
    );
  }

  const thumb   = getThumbnail(video);
  const isYT    = video.source === "youtube";
  const watchUrl = isYT
    ? `/watch-yt/${video._id}`
    : `/watch/${video._id}`;

  return (
    <div className="min-h-screen bg-prime-bg pb-16">
      {/* Backdrop */}
      <section className="relative h-[50vw] max-h-[70vh] min-h-[320px] w-full overflow-hidden">
        <img src={thumb} alt={video.title} className="absolute inset-0 w-full h-full object-cover"/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to right,#0F171E 30%,rgba(15,23,30,0.5) 60%,transparent)"}}/>
        <div className="absolute inset-0" style={{background:"linear-gradient(to top,#0F171E 0%,rgba(15,23,30,0.3) 40%,transparent)"}}/>

        <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:0.5}}
          className="absolute bottom-8 left-0 px-4 sm:px-6 lg:px-10 max-w-2xl">

          {isYT && (
            <div className="flex items-center gap-1.5 mb-2">
              <Youtube size={14} className="text-red-500"/>
              <span className="text-xs text-prime-muted font-medium">YouTube</span>
            </div>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
            {video.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={watchUrl}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm text-white transition-all"
              style={{background:"#00A8E1"}}
             >
              <Play size={18} fill="white"/>
              {isYT ? "Watch on YouTube" : "Play"}
            </Link>
            <button className="w-10 h-10 flex items-center justify-center border border-white/30 rounded-full text-white hover:border-white bg-black/30 backdrop-blur-sm transition-colors">
              <Plus size={18}/>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-white/30 rounded-full text-white hover:border-white bg-black/30 backdrop-blur-sm transition-colors">
              <ThumbsUp size={16}/>
            </button>
            <button className="w-10 h-10 flex items-center justify-center border border-white/30 rounded-full text-white hover:border-white bg-black/30 backdrop-blur-sm transition-colors">
              <Share2 size={16}/>
            </button>
          </div>
        </motion.div>
      </section>

      {/* Info */}
      <section className="px-4 sm:px-6 lg:px-10 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-prime-accent border border-prime-accent/40 px-2 py-0.5 rounded-sm">
              {video.type || "movie"}
            </span>
            {video.year && (
              <div className="flex items-center gap-1 text-prime-muted">
                <Calendar size={13}/> {video.year}
              </div>
            )}
            {video.rating && (
              <span className="text-prime-muted text-xs border border-prime-border px-1.5 py-0.5 rounded-sm">
                {video.rating}
              </span>
            )}
          </div>

          {video.description && (
            <p className="text-prime-muted leading-relaxed text-sm sm:text-base mb-4">
              {video.description}
            </p>
          )}

          {video.genres?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {video.genres.map(g => (
                <span key={g} className="px-2.5 py-1 text-xs text-prime-muted bg-prime-elevated border border-prime-border rounded-sm">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Details card */}
        <div className="bg-prime-surface border border-prime-border rounded p-4 h-fit">
          <h3 className="text-sm font-semibold text-white mb-3">Details</h3>
          <dl className="space-y-2.5 text-sm">
            {[
              { label: "Type",   value: video.type },
              { label: "Year",   value: video.year },
              { label: "Rating", value: video.rating },
              { label: "Source", value: isYT ? "YouTube" : "Vyooh Original" },
              { label: "Status", value: video.status },
            ].filter(d => d.value).map(d => (
              <div key={d.label} className="flex justify-between">
                <dt className="text-prime-muted">{d.label}</dt>
                <dd className={`text-white capitalize font-medium ${
                  d.label==="Status" && d.value==="ready" ? "text-green-400" :
                  d.label==="Status" && d.value==="failed" ? "text-red-400" :
                  d.label==="Status" ? "text-yellow-400" : ""}`}>
                  {d.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
