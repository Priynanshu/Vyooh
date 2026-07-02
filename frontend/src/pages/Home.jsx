import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import { fetchVideos, selectVideos, selectVideoLoading } from "../features/video/videoSlice";
import { selectIsLoggedIn } from "../features/auth/authSlice";
import ContentRail from "../features/video/components/ContentRail";

function getThumbnail(v) {
  if (v.source === "youtube" && v.videoId)
    return `https://img.youtube.com/vi/${v.videoId}/maxresdefault.jpg`;
  return v.thumbnail || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&fit=crop";
}

function HeroSkeleton() {
  return (
    <div className="relative h-[56vw] max-h-[80vh] min-h-[400px] w-full bg-prime-surface skeleton" />
  );
}

function Hero({ video }) {
  if (!video) return null;
  const watchUrl = video.source === "youtube" ? `/watch-yt/${video._id}` : `/watch/${video._id}`;
  return (
    <section className="relative h-[56vw] max-h-[80vh] min-h-[400px] w-full overflow-hidden">
      <img src={getThumbnail(video)} alt={video.title}
        className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{background:"linear-gradient(to right,#0F171E 30%,rgba(15,23,30,0.5) 60%,transparent)"}} />
      <div className="absolute inset-0" style={{background:"linear-gradient(to top,#0F171E 0%,rgba(15,23,30,0.3) 40%,transparent)"}} />

      <motion.div initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{duration:0.6}}
        className="absolute bottom-[12%] left-0 px-4 sm:px-8 lg:px-12 max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-prime-accent border border-prime-accent/50 px-2 py-0.5 rounded-sm">
            {video.type || "Movie"}
          </span>
          {video.genres?.slice(0,2).map(g=>(
            <span key={g} className="text-xs text-prime-muted">{g}</span>
          ))}
        </div>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-3 drop-shadow-lg">
          {video.title}
        </h1>
        {video.description && (
          <p className="text-prime-muted text-sm sm:text-base leading-relaxed mb-5 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center gap-3">
          <Link to={watchUrl}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded font-semibold text-sm text-white transition-all"
            style={{background:"#00A8E1"}}
           >
            <Play size={18} fill="white"/>Watch now
          </Link>
          <Link to={`/title/${video._id}`}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded font-medium text-sm text-white border border-white/30 bg-white/10 hover:bg-white/20 transition-colors">
            <Info size={16}/>Details
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const dispatch   = useDispatch();
  const videos     = useSelector(selectVideos);
  const loading    = useSelector(selectVideoLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchVideos({ page:1, limit:50 }));
  }, [dispatch, isLoggedIn]);

  const ready   = useMemo(()=> videos.filter(v=>v.status==="ready"), [videos]);
  const movies  = useMemo(()=> ready.filter(v=>v.type==="movie"), [ready]);
  const series  = useMemo(()=> ready.filter(v=>v.type==="series"), [ready]);
  const yt      = useMemo(()=> videos.filter(v=>v.source==="youtube"), [videos]);
  const recent  = useMemo(()=> [...ready].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,10), [ready]);
  const featured = ready[0] || null;

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-prime-bg flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-sm flex items-center justify-center mb-6" style={{background:"#00A8E1"}}>
          <span className="text-white font-bold text-2xl">V</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Vyooh par aapka swagat hai</h1>
        <p className="text-prime-muted text-lg mb-8 max-w-md">Movies aur web series HD quality mein dekhein, kabhi bhi, kahin bhi.</p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="px-8 py-3 rounded font-semibold text-white text-sm" style={{background:"#00A8E1"}}>
            Sign in
          </Link>
          <Link to="/register" className="px-8 py-3 rounded font-semibold text-white text-sm border border-white/30 hover:bg-white/10 transition-colors">
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-prime-bg pb-16">
      {loading ? <HeroSkeleton /> : <Hero video={featured} />}

      <div className="relative -mt-12 sm:-mt-20 z-10">
        {recent.length > 0 && <ContentRail title="New Releases" videos={recent} loading={loading} badge="New" />}
        {movies.length > 0 && <ContentRail title="Movies" videos={movies} loading={loading} />}
        {series.length > 0 && <ContentRail title="Web Series" videos={series} loading={loading} />}
        {yt.length > 0    && <ContentRail title="From YouTube" videos={yt} loading={loading} />}

        {!loading && videos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center px-4">
            <p className="text-4xl mb-4">🎬</p>
            <h2 className="text-white font-semibold text-lg mb-2">Koi content nahi abhi</h2>
            <p className="text-prime-muted text-sm">Admin panel se videos upload karein.</p>
          </div>
        )}
      </div>
    </div>
  );
}
