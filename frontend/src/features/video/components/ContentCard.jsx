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

export default function ContentCard({ video, size = "md" }) {
  const [hovered, setHovered] = useState(false);
  const widths = { sm:"w-40 sm:w-44", md:"w-48 sm:w-56", lg:"w-56 sm:w-64" };
  const watchUrl = video.source === "youtube"
    ? `/watch-yt/${video._id}`
    : `/watch/${video._id}`;

  return (
    <div className={`${widths[size]} flex-shrink-0 group relative`}
      onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}>
      <Link to={`/title/${video._id}`}>
        <div className="relative rounded overflow-hidden aspect-video bg-prime-elevated cursor-pointer">
          <img src={getThumbnail(video)} alt={video.title} loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={e=>{e.target.src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600";}}/>

          {video.source === "youtube" && (
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/70 rounded px-1.5 py-0.5">
              <Youtube size={10} className="text-red-500"/>
              <span className="text-[9px] text-white font-medium">YouTube</span>
            </div>
          )}

          {video.status && video.status !== "ready" && video.status !== "published" && (
            <div className="absolute top-1.5 right-1.5 bg-yellow-500/90 text-black text-[9px] font-bold px-1.5 py-0.5 rounded capitalize">
              {video.status}
            </div>
          )}

          <AnimatePresence>
            {hovered && (
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}
                className="absolute inset-0 flex flex-col justify-end p-2.5"
                style={{background:"linear-gradient(to top,rgba(15,23,30,0.95) 0%,rgba(15,23,30,0.5) 50%,transparent)"}}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Link to={watchUrl} onClick={e=>e.stopPropagation()}
                    className="w-7 h-7 flex items-center justify-center rounded-full text-prime-bg"
                    style={{background:"white"}} aria-label="Play">
                    <Play size={12} fill="currentColor"/>
                  </Link>
                  <button className="w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white transition-colors" aria-label="Add">
                    <Plus size={13}/>
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white transition-colors" aria-label="Like">
                    <ThumbsUp size={12}/>
                  </button>
                  <Link to={`/title/${video._id}`} onClick={e=>e.stopPropagation()}
                    className="ml-auto w-7 h-7 flex items-center justify-center rounded-full border border-white/40 text-white hover:border-white transition-colors" aria-label="More info">
                    <Info size={12}/>
                  </Link>
                </div>
                <p className="text-white text-xs font-semibold truncate">{video.title}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-prime-accent text-[10px] font-semibold uppercase">{video.type}</span>
                  {video.genres?.[0] && <span className="text-prime-muted text-[10px]">· {video.genres[0]}</span>}
                  {video.year && <span className="text-prime-muted text-[10px]">· {video.year}</span>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
      <p className="mt-1.5 text-xs text-prime-muted truncate group-hover:text-white transition-colors px-0.5">
        {video.title}
      </p>
    </div>
  );
}
