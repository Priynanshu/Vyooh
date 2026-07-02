import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Hls from "hls.js";
import { Loader2, ArrowLeft } from "lucide-react";
import { useVideoPlayer } from "../components/player/useVideoPlayer";
import PlayerControls from "../components/player/PlayerControls";
import api from "../services/api";
import { API, API_BASE_URL } from "../constants";

export default function Watch() {
  const { id } = useParams();
  const player = useVideoPlayer();
  const hlsRef = useRef(null);
  const [hlsReady, setHlsReady] = useState(false);
  const [controls, setControls] = useState(true);
  const [error, setError] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const hideTimer = useRef(null);
  const histTimer = useRef(null);

  const showControls = useCallback(() => {
    setControls(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (player.playing) setControls(false);
    }, 3000);
  }, [player.playing]);

  useEffect(() => {
    let hls;
    async function init() {
      try {
        // Get video details first
        const detailRes = await api.get(API.VIDEO_DETAIL(id));
        const vid = detailRes.data.data;
        setVideoTitle(vid.title || "");

        if (vid.status !== "ready") {
          setError(`Video abhi ${vid.status} hai — play nahi ho sakti`);
          return;
        }

        // Get stream URL
        const streamRes = await api.get(API.VIDEO_STREAM(id));
        const { playbackUrl } = streamRes.data;

        const video = player.videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
          hls = new Hls({
            maxBufferLength: 30,
            enableWorker: false,
            xhrSetup: (xhr) => {
              xhr.withCredentials = true; // cookies bhejo har HLS request mein
            },
          });
          hls.loadSource(playbackUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setHlsReady(true);
            video.play().catch(() => { });
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) setError("Video load karne mein problem aayi");
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = playbackUrl;
          setHlsReady(true);
          video.play().catch(() => { });
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Video load nahi ho saki");
      }
    }

    init();
    return () => {
      hls?.destroy();
      hlsRef.current = null;
      clearInterval(histTimer.current);
    };
  }, [id]);

  const currentTimeRef = useRef(0);
const durationRef     = useRef(0);

// Yeh dono refs ko sync rakho jab bhi player update ho
useEffect(() => {
  currentTimeRef.current = player.currentTime;
  durationRef.current    = player.duration;
}, [player.currentTime, player.duration]);

// History save effect — ab ref se latest value lo
useEffect(() => {
  if (!player.playing) return;

  histTimer.current = setInterval(() => {
    const progress = durationRef.current
      ? Math.round((currentTimeRef.current / durationRef.current) * 100)
      : 0;
    api.post(API.HISTORY_SAVE, {
      videoId: id,
      progress,
      watchedDuration: Math.round(currentTimeRef.current),
    }).catch(()=>{});
  }, 30000);

  return () => clearInterval(histTimer.current);
}, [player.playing, id]);

  // Keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); player.togglePlay(); break;
        case "ArrowRight": player.skip(10); break;
        case "ArrowLeft": player.skip(-10); break;
        case "ArrowUp": e.preventDefault(); player.changeVolume(Math.min(1, player.volume + 0.1)); break;
        case "ArrowDown": e.preventDefault(); player.changeVolume(Math.max(0, player.volume - 0.1)); break;
        case "f": player.toggleFullscreen(); break;
        case "m": player.toggleMute(); break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [player]);

  if (error) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <Link to="/" className="text-prime-accent text-sm hover:underline">← Go back</Link>
      </div>
    );
  }

  return (
    <div
      ref={player.containerRef}
      className="relative w-screen h-screen bg-black overflow-hidden"
      onMouseMove={showControls}
      onMouseLeave={() => player.playing && setControls(false)}
    >
      <video
        ref={player.videoRef}
        className="w-full h-full object-contain"
        playsInline
      />

      {player.loading && !player.playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={44} className="text-prime-accent animate-spin" />
        </div>
      )}

      <PlayerControls
        player={player}
        hlsRef={hlsRef}
        hlsReady={hlsReady}
        title={videoTitle}
        visible={controls}
        onMouseMove={showControls}
      />
    </div>
  );
}
