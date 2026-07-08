import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchVideos, selectVideos, selectVideoLoading } from "../features/video/videoSlice";
import { selectIsLoggedIn } from "../features/auth/authSlice";
import ContentRail from "../features/video/components/ContentRail";
// HeroBanner Component Import Kiya
import HeroBanner from "../features/video/components/HeroBanner"; 

export default function Home() {
  const dispatch   = useDispatch();
  const videos     = useSelector(selectVideos);
  const loading    = useSelector(selectVideoLoading);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (isLoggedIn) dispatch(fetchVideos({ page: 1, limit: 50 }));
  }, [dispatch, isLoggedIn]);

  const ready   = useMemo(() => videos.filter(v => v.status === "ready"), [videos]);
  const movies  = useMemo(() => ready.filter(v => v.type === "movie"), [ready]);
  const series  = useMemo(() => ready.filter(v => v.type === "series"), [ready]);
  const yt      = useMemo(() => videos.filter(v => v.source === "youtube"), [videos]);
  const recent  = useMemo(() => [...ready].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10), [ready]);

  // if (!isLoggedIn) {
  //   return (
  //     <div className="min-h-screen bg-prime-bg flex flex-col items-center justify-center text-center px-4">
  //       <div className="w-16 h-16 rounded-sm flex items-center justify-center mb-6" style={{ background: "#00A8E1" }}>
  //         <span className="text-white font-bold text-2xl">V</span>
  //       </div>
  //       <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Welcome on Vyooh Platform</h1>
  //       <p className="text-prime-muted text-lg mb-8 max-w-md">Watch Movies and Series in HD quality, Anywhere Anytime.</p>
  //       <div className="flex items-center gap-4">
  //         <Link to="/login" className="px-8 py-3 rounded font-semibold text-white text-sm" style={{ background: "#00A8E1" }}>
  //           Sign in
  //         </Link>
  //         <Link to="/register" className="px-8 py-3 rounded font-semibold text-white text-sm border border-white/30 hover:bg-white/10 transition-colors">
  //           Create account
  //         </Link>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-prime-bg pb-16">
      {/* 
        Yahan static Banner ko replace kiya HeroBanner se 
        Aur pure ready videos array ko pass kar diya continuous auto-shifting ke liye
      */}
      <HeroBanner videos={ready} loading={loading} />

      <div className="relative -mt-6 sm:-mt-10 lg:-mt-14 z-30 px-4 sm:px-6 lg:px-10 space-y-2">
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