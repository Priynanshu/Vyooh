import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import {
  Play, Pause, Volume2, Volume1, VolumeX,
  Maximize, Minimize, RotateCcw, RotateCw,
  Settings, SkipForward, ArrowLeft, Loader2, Check,
} from "lucide-react";
import { formatTime } from "../../utils/formatTime";
import { PLAYBACK_SPEEDS } from "../../constants";

export default function PlayerControls({
  player, hlsRef, hlsReady,
  title, episodeLabel, visible, onMouseMove,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab]   = useState("speed");
  const [levels, setLevels]             = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto

  const {
    playing, currentTime, duration, buffered,
    volume, muted, fullscreen, playbackRate, loading,
    togglePlay, seek, skip, changeVolume, toggleMute,
    changePlaybackRate, toggleFullscreen,
  } = player;

  // HLS quality levels populate karo
  useEffect(() => {
    const hls = hlsRef?.current;
    if (!hls) return;

    const onManifest = () => setLevels(hls.levels || []);
    const onSwitched = (_, data) => setCurrentLevel(data.level);

    hls.on(Hls.Events.MANIFEST_PARSED, onManifest);
    hls.on(Hls.Events.LEVEL_SWITCHED, onSwitched);

    if (hls.levels?.length) setLevels(hls.levels);

    return () => {
      hls.off(Hls.Events.MANIFEST_PARSED, onManifest);
      hls.off(Hls.Events.LEVEL_SWITCHED, onSwitched);
    };
  }, [hlsRef, hlsReady]);

  const handleQualityChange = (levelIndex) => {
    const hls = hlsRef?.current;
    if (hls) hls.currentLevel = levelIndex;
    setCurrentLevel(levelIndex);
    setSettingsOpen(false);
  };

  const progressPct  = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPct  = duration ? (buffered / duration) * 100 : 0;
  const VolumeIcon   = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div
      onMouseMove={onMouseMove}
      className={`absolute inset-0 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Loader2 size={44} className="text-prime-accent animate-spin" />
        </div>
      )}

      {/* Click to play/pause */}
      <button
        className="absolute inset-0 w-full h-full cursor-pointer"
        onClick={togglePlay}
        aria-label={playing ? "Pause" : "Play"}
        tabIndex={-1}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent px-4 sm:px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <p className="text-white font-semibold text-sm sm:text-base leading-tight">{title}</p>
          {episodeLabel && (
            <p className="text-white/60 text-xs mt-0.5">{episodeLabel}</p>
          )}
        </div>
      </div>

      {/* Center play button */}
      {!loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <AnimatePresence>
            {!playing && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={togglePlay}
                className="pointer-events-auto w-16 h-16 rounded-full bg-prime-accent/80 backdrop-blur-sm flex items-center justify-center hover:bg-prime-accent transition-colors shadow-prime"
                aria-label="Play"
              >
                <Play size={28} fill="white" className="text-white ml-1" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 sm:px-6 pb-4 pt-10">
        {/* Progress bar */}
        <div className="relative mb-3 group/progress cursor-pointer">
          <div className="h-1 group-hover/progress:h-1.5 transition-all rounded-full bg-white/20 relative">
            {/* Buffered */}
            <div
              className="absolute h-full rounded-full bg-white/30 transition-all"
              style={{ width: `${bufferedPct}%` }}
            />
            {/* Played */}
            <div
              className="absolute h-full rounded-full bg-prime-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-prime-accent opacity-0 group-hover/progress:opacity-100 transition-opacity shadow"
              style={{ left: `calc(${progressPct}% - 7px)` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.5}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-6 -top-2"
            aria-label="Seek"
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between">
          {/* Left controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-prime-accent transition-colors"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing
                ? <Pause size={22} fill="white" />
                : <Play size={22} fill="white" />}
            </button>

            <button
              onClick={() => skip(-10)}
              className="hidden sm:block text-white/80 hover:text-white transition-colors"
              aria-label="Rewind 10s"
            >
              <RotateCcw size={19} />
            </button>

            <button
              onClick={() => skip(10)}
              className="hidden sm:block text-white/80 hover:text-white transition-colors"
              aria-label="Forward 10s"
            >
              <RotateCw size={19} />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                onClick={toggleMute}
                className="text-white/80 hover:text-white transition-colors"
                aria-label={muted ? "Unmute" : "Mute"}
              >
                <VolumeIcon size={19} />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => changeVolume(Number(e.target.value))}
                className="w-0 group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-200 overflow-hidden"
                aria-label="Volume"
                style={{
                  accentColor: "#00A8E1",
                }}
              />
            </div>

            {/* Time */}
            <span className="text-white/80 text-xs sm:text-sm font-medium tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="hidden sm:flex items-center gap-1.5 text-white/80 hover:text-white text-xs transition-colors">
              <SkipForward size={18} />
              <span className="hidden lg:inline">Next</span>
            </button>

            {/* Settings */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen((v) => !v)}
                className={`text-white/80 hover:text-white transition-colors ${settingsOpen ? "text-prime-accent" : ""}`}
                aria-label="Settings"
              >
                <Settings size={19} />
              </button>

              <AnimatePresence>
                {settingsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-9 right-0 w-52 bg-prime-surface/95 backdrop-blur-sm border border-prime-border rounded-prime shadow-card-hover overflow-hidden"
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-prime-border">
                      {["speed", "quality"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setSettingsTab(tab)}
                          className={`flex-1 py-2 text-xs font-semibold capitalize transition-colors ${
                            settingsTab === tab
                              ? "text-prime-accent border-b-2 border-prime-accent"
                              : "text-prime-muted hover:text-prime-text"
                          }`}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Options */}
                    <div className="max-h-44 overflow-y-auto py-1">
                      {settingsTab === "speed" &&
                        PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => { changePlaybackRate(speed); setSettingsOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-prime-muted hover:text-prime-text hover:bg-prime-elevated transition-colors"
                          >
                            {speed === 1 ? "Normal" : `${speed}×`}
                            {playbackRate === speed && <Check size={13} className="text-prime-accent" />}
                          </button>
                        ))}

                      {settingsTab === "quality" && (
                        <>
                          <button
                            onClick={() => handleQualityChange(-1)}
                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-prime-muted hover:text-prime-text hover:bg-prime-elevated transition-colors"
                          >
                            Auto
                            {currentLevel === -1 && <Check size={13} className="text-prime-accent" />}
                          </button>
                          {levels.map((level, i) => (
                            <button
                              key={i}
                              onClick={() => handleQualityChange(i)}
                              className="w-full flex items-center justify-between px-4 py-2 text-sm text-prime-muted hover:text-prime-text hover:bg-prime-elevated transition-colors"
                            >
                              {level.height}p
                              {currentLevel === i && <Check size={13} className="text-prime-accent" />}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleFullscreen}
              className="text-white/80 hover:text-white transition-colors"
              aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
