import { useEffect, useRef, useState, useCallback } from "react";

export function useVideoPlayer() {
  const videoRef     = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying]           = useState(false);
  const [currentTime, setCurrentTime]   = useState(0);
  const [duration, setDuration]         = useState(0);
  const [buffered, setBuffered]         = useState(0);
  const [volume, setVolume]             = useState(1);
  const [muted, setMuted]               = useState(false);
  const [fullscreen, setFullscreen]     = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else          { v.pause(); setPlaying(false); }
  }, []);

  const seek = useCallback((time) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(time, v.duration || 0));
    setCurrentTime(v.currentTime);
  }, []);

  const skip = useCallback((seconds) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.currentTime + seconds, v.duration || 0));
  }, []);

  const changeVolume = useCallback((val) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = Math.max(0, Math.min(1, val));
    setVolume(v.volume);
    if (v.volume === 0) { v.muted = true; setMuted(true); }
    else                { v.muted = false; setMuted(false); }
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const changePlaybackRate = useCallback((rate) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
  }, []);

  const toggleFullscreen = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    if (!document.fullscreenElement) {
      c.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onTime     = () => setCurrentTime(v.currentTime);
    const onMeta     = () => { setDuration(v.duration); setLoading(false); };
    const onProgress = () => {
      if (v.buffered.length > 0)
        setBuffered(v.buffered.end(v.buffered.length - 1));
    };
    const onWaiting  = () => setLoading(true);
    const onPlaying  = () => { setLoading(false); setPlaying(true); };
    const onPause    = () => setPlaying(false);
    const onEnded    = () => setPlaying(false);
    const onError    = () => setError("Video load nahi ho saka");
    const onFsChange = () => setFullscreen(!!document.fullscreenElement);

    v.addEventListener("timeupdate",      onTime);
    v.addEventListener("loadedmetadata",  onMeta);
    v.addEventListener("progress",        onProgress);
    v.addEventListener("waiting",         onWaiting);
    v.addEventListener("playing",         onPlaying);
    v.addEventListener("pause",           onPause);
    v.addEventListener("ended",           onEnded);
    v.addEventListener("error",           onError);
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      v.removeEventListener("timeupdate",      onTime);
      v.removeEventListener("loadedmetadata",  onMeta);
      v.removeEventListener("progress",        onProgress);
      v.removeEventListener("waiting",         onWaiting);
      v.removeEventListener("playing",         onPlaying);
      v.removeEventListener("pause",           onPause);
      v.removeEventListener("ended",           onEnded);
      v.removeEventListener("error",           onError);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, []);

  return {
    videoRef, containerRef,
    playing, currentTime, duration, buffered,
    volume, muted, fullscreen, playbackRate, loading, error,
    togglePlay, seek, skip, changeVolume, toggleMute,
    changePlaybackRate, toggleFullscreen,
  };
}
