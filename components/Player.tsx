"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useStore, LicenseType } from "../context/StoreContext";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Download, 
  ChevronUp, 
  Volume2, 
  VolumeX, 
  Disc, 
  Music,
  ShoppingBag,
  AlertCircle,
  Repeat,
  Repeat1
} from "lucide-react";

export default function Player() {
  const {
    activeBeat,
    isPlaying,
    currentTime,
    duration,
    volume,
    isAudioLoading,
    audioError,
    repeatMode,
    togglePlayPause,
    seek,
    setVolumeState,
    skipNext,
    skipPrevious,
    toggleRepeatMode,
    openCheckout,
    showToast,
    clearAudioError
  } = useStore();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDraggingScrubber, setIsDraggingScrubber] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Time formatter
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle free preview MP3 download
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeBeat) return;
    
    showToast(`Downloading free MP3 preview: ${activeBeat.title}`, "success");
    const link = document.createElement("a");
    link.href = activeBeat.mp3Url;
    link.setAttribute("download", `${activeBeat.title} - Preview.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Scrubber click/drag handler
  const handleScrubMove = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!activeBeat || duration === 0 || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clickX = clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    seek(pct * duration);
  }, [activeBeat, duration, seek]);

  const handleScrubStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeBeat || duration === 0 || !progressBarRef.current) return;
    setIsDraggingScrubber(true);
    handleScrubMove(e);
  };

  const handleScrubHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeBeat || duration === 0 || !progressBarRef.current) return;
    
    const rect = progressBarRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, hoverX / width));
    setHoverPercent(pct * 100);
    setHoverTime(pct * duration);
  };

  const handleScrubLeave = () => {
    setHoverTime(null);
  };

  useEffect(() => {
    if (!isDraggingScrubber) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleScrubMove(e);
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingScrubber(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingScrubber, activeBeat, duration, handleScrubMove]);

  const handleCheckoutClick = (licenseType: LicenseType) => {
    if (!activeBeat) return;
    setDropdownOpen(false);
    openCheckout(activeBeat, licenseType);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Error Banner */}
      {audioError && (
        <div 
          className="flex items-center justify-between gap-4 px-4 py-2 bg-danger/10 border-b border-danger/20 text-danger-fg"
          role="alert"
          aria-live="assertive"
        >
          <span className="text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {audioError}
          </span>
          <button
            onClick={clearAudioError}
            className="text-danger-fg hover:bg-danger/20 rounded px-2 py-1 transition-colors"
            aria-label="Dismiss error"
          >
            ✕
          </button>
        </div>
      )}

      {/* Player Footer */}
      <footer className="h-[68px] bg-[var(--player-bg)] border-t border-[var(--player-border)] transition-colors duration-150 shadow-[0_-4px_24px_rgba(0,0,0,0.15)]">
      <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between gap-4">
        
        {/* Left Side: Beat Artwork + Title Metadata */}
        <div className="w-[220px] flex items-center gap-3 flex-shrink-0">
          {activeBeat ? (
            <>
              {/* Spinning record preview or static icon depending on playing state */}
              <div 
                className={`w-10 h-10 rounded-[5px] bg-gradient-to-br ${activeBeat.coverColor} flex items-center justify-center border border-border-default flex-shrink-0 shadow-inner overflow-hidden relative group`}
              >
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Music className="w-3.5 h-3.5 text-white" />
                </div>
                <Disc 
                  className={`w-5 h-5 text-text-secondary ${
                    isPlaying ? "animate-[spin_4s_linear_infinite]" : ""
                  }`} 
                />
              </div>
              <div className="overflow-hidden">
                <h4 className="font-syne font-medium text-[13px] text-text-primary truncate leading-tight">
                  {activeBeat.title}
                </h4>
                <p className="font-mono text-[10px] text-text-muted mt-0.5 truncate uppercase tracking-wider">
                  {activeBeat.genre} · {activeBeat.bpm} BPM · {activeBeat.key}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-text-disabled">
              <div className="w-10 h-10 rounded-[5px] bg-bg-elevated border border-border-subtle flex items-center justify-center">
                <Music className="w-4 h-4 text-text-disabled" />
              </div>
              <div>
                <p className="font-syne text-[12px]">No beat selected</p>
                <p className="font-mono text-[9px] uppercase tracking-wider">Select to preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Center: Transport Controls + Scrubber Progress */}
        <div className="flex-1 max-w-[620px] flex items-center gap-4">
          {/* Back Button */}
          <button
            onClick={skipPrevious}
            disabled={!activeBeat}
            className="btn-ghost p-1 text-text-secondary disabled:text-text-disabled disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Previous beat"
            title="Previous beat (P)"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className={`w-9 h-9 rounded-full flex items-center justify-center cursor-pointer transition-all duration-100 ${
              activeBeat 
                ? "bg-[var(--accent)] text-[var(--accent-fg)] hover:scale-105 active:scale-95" 
                : "bg-bg-elevated text-text-disabled cursor-not-allowed border border-border-subtle"
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
            aria-pressed={isPlaying}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-[var(--accent-fg)]" />
            ) : (
              <Play className="w-4 h-4 fill-current translate-x-[1px] text-[var(--accent-fg)]" />
            )}
          </button>

          {/* Forward Button */}
          <button
            onClick={skipNext}
            disabled={!activeBeat}
            className="btn-ghost p-1 text-text-secondary disabled:text-text-disabled disabled:opacity-40 disabled:hover:bg-transparent"
            aria-label="Next beat"
            title="Next beat (N)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Scrubber Progress Slider */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-text-muted w-8 text-right">
                {formatTime(currentTime)}
              </span>

              <div 
                ref={progressBarRef}
                onMouseDown={handleScrubStart}
                onMouseMove={handleScrubHover}
                onMouseLeave={handleScrubLeave}
                className={`h-[4px] flex-1 rounded-[var(--radius-full)] bg-[var(--scrubber-track)] relative cursor-pointer group ${isAudioLoading ? 'opacity-60' : ''} ${isDraggingScrubber ? 'h-[6px]' : ''}`}
                role="slider"
                aria-label="Seek to position"
                aria-valuemin={0}
                aria-valuemax={Math.round(duration) || 0}
                aria-valuenow={Math.round(currentTime) || 0}
                aria-valuetext={`${formatTime(currentTime)} / ${formatTime(duration)}`}
              >
                {/* Scrub Fill Bar */}
                <div 
                  className="absolute left-0 top-0 h-full rounded-[var(--radius-full)] bg-[var(--scrubber-fill)]" 
                  style={{ width: `${progressPercent}%` }}
                />
                
                {/* Loading indicator */}
                {isAudioLoading && (
                  <div 
                    className="absolute left-0 top-0 h-full rounded-[var(--radius-full)] bg-[var(--text-secondary)]/30 animate-pulse" 
                    style={{ width: `${progressPercent}%` }}
                  />
                )}
                
                {/* Slider Thumb Handle */}
                <div 
                  className={`absolute top-1/2 w-2.5 h-2.5 rounded-full bg-[var(--scrubber-thumb)] opacity-0 transition-opacity -translate-y-1/2 -translate-x-1/2 ${isDraggingScrubber ? 'opacity-100 w-3 h-3' : 'group-hover:opacity-100'}`}
                  style={{ left: `${progressPercent}%` }}
                />

                {/* Hover Time Preview */}
                {hoverTime !== null && !isDraggingScrubber && (
                  <div 
                    className="absolute bottom-full mb-1 -translate-x-1/2 bg-bg-elevated border border-border-default rounded px-2 py-1 text-[10px] text-text-secondary font-mono whitespace-nowrap pointer-events-none"
                    style={{ left: `${hoverPercent}%` }}
                  >
                    {formatTime(hoverTime)}
                  </div>
                )}
              </div>

              <span className="font-mono text-[11px] text-text-muted w-8">
                {formatTime(duration)}
              </span>
            </div>

            {/* Hover Time Preview (for drag state) */}
            {hoverTime !== null && isDraggingScrubber && (
              <div className="flex justify-center mt-1">
                <div className="bg-bg-elevated border border-border-default rounded px-2 py-1 text-[11px] text-text-secondary font-mono">
                  {formatTime(hoverTime)}
                </div>
              </div>
            )}
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-1.5 w-24">
            <button
              onClick={() => setVolumeState(volume === 0 ? 0.8 : 0)}
              disabled={!activeBeat}
              className="text-text-secondary disabled:text-text-disabled"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
              title={volume === 0 ? "Unmute (M)" : "Mute (M)"}
            >
              {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              disabled={!activeBeat}
              onChange={(e) => setVolumeState(parseFloat(e.target.value))}
              className="w-full h-[3px] accent-text-primary bg-border-strong rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed opacity-60 hover:opacity-100 disabled:opacity-30"
              aria-label="Volume level"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              title="Volume ([ or -: decrease, ] or +: increase)"
            />
          </div>

          {/* Repeat Mode Button */}
          <button
            onClick={toggleRepeatMode}
            disabled={!activeBeat}
            className={`p-1 text-text-secondary disabled:text-text-disabled disabled:opacity-40 transition-colors ${
              repeatMode !== "off" ? "text-accent" : ""
            }`}
            aria-label={`Repeat mode: ${repeatMode}`}
            title={`Repeat: ${repeatMode === "off" ? "Off (click to enable)" : repeatMode === "one" ? "One (click for all)" : "All (click to disable)"}`}
          >
            {repeatMode === "one" ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right Side: Free Download & Checkout Controls */}
        <div className="flex items-center gap-2.5 flex-shrink-0 relative">
          <button
            onClick={handleDownload}
            disabled={!activeBeat}
            className="btn-secondary h-9 px-3.5 flex items-center gap-1.5 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">FREE PREVIEW</span>
          </button>

          {/* Checkout Selector Group */}
          <div ref={dropdownRef} className="relative flex items-center">
            {activeBeat?.exclusiveSold ? (
              <button
                disabled
                className="btn-secondary h-9 text-[11px] px-6 text-text-disabled font-medium opacity-65 border-dashed cursor-not-allowed uppercase"
              >
                Sold Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleCheckoutClick("non-exclusive")}
                  disabled={!activeBeat}
                  className="btn-primary h-9 pl-4 pr-3.5 flex items-center gap-2 text-[11px] disabled:opacity-40 disabled:cursor-not-allowed rounded-r-none border-r border-accent-fg/10"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  BUY — ${activeBeat ? activeBeat.nonExclusivePrice.toFixed(2) : "0.00"}
                </button>
                
                <button
                  onClick={() => activeBeat && setDropdownOpen(!dropdownOpen)}
                  disabled={!activeBeat}
                  className="btn-primary h-9 px-2 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed rounded-l-none"
                  aria-label="Choose License Type"
                >
                  <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
              </>
            )}

            {/* License Dropdown Panel */}
            {dropdownOpen && activeBeat && (
              <div 
                className="absolute bottom-[48px] right-0 w-[240px] bg-bg-surface border border-border-default rounded-lg p-2 shadow-2xl animate-slideUp z-50"
              >
                <div className="text-[10px] text-text-muted font-syne uppercase tracking-wider px-2 py-1.5 border-b border-border-subtle mb-1">
                  Select License
                </div>

                {activeBeat.nonExclusiveEnabled && (
                  <button
                    onClick={() => handleCheckoutClick("non-exclusive")}
                    className="w-full text-left p-2 rounded-md hover:bg-bg-hover transition-colors flex flex-col group"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-syne font-medium text-[12px] text-text-primary group-hover:text-accent">
                        Non-Exclusive
                      </span>
                      <span className="font-mono text-[12px] text-text-primary">
                        ${activeBeat.nonExclusivePrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted mt-0.5">
                      Stream / upload capabilities, royalty caps
                    </span>
                  </button>
                )}

                {activeBeat.exclusiveEnabled && (
                  <button
                    onClick={() => handleCheckoutClick("exclusive")}
                    className="w-full text-left p-2 rounded-md hover:bg-bg-hover transition-colors flex flex-col group mt-1"
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="font-syne font-medium text-[12px] text-text-primary group-hover:text-accent">
                        Exclusive
                      </span>
                      <span className="font-mono text-[12px] text-text-primary">
                        ${activeBeat.exclusivePrice.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-muted mt-0.5">
                      Solo ownership, 100% royalty retrieval
                    </span>
                    {activeBeat?.nonExclusiveSold && activeBeat.nonExclusiveSold > 0 && (
                      <span className="font-mono text-[9px] text-success-text mt-0.5">
                        {activeBeat.nonExclusiveSold} non-excl. already sold
                      </span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
      </footer>
    </div>
  );
}
