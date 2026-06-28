"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore, LicenseType } from "../context/StoreContext";
import { X, Play, Pause, Download, ShoppingBag, Music, Disc, AlertCircle, Repeat, Repeat1, ShoppingCart } from "lucide-react";

export default function BeatDetailModal() {
  const {
    detailModalBeat,
    setDetailModalBeat,
    activeBeat,
    isPlaying,
    currentTime,
    duration,
    isAudioLoading,
    audioError,
    repeatMode,
    togglePlayPause,
    playBeat,
    seek,
    openCheckout,
    showToast,
    toggleRepeatMode,
    clearAudioError,
    audioAnalyzer,
    addToCart,
    setIsCartOpen
  } = useStore();

  const [selectedLicense, setSelectedLicense] = useState<LicenseType>("non-exclusive");
  const [isDraggingWaveform, setIsDraggingWaveform] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number>(0);
  const waveContainerRef = useRef<HTMLDivElement>(null);

  // Sync selected license availability when detailModalBeat changes
  useEffect(() => {
    if (!detailModalBeat) return;
    
    const nonExclAvailable = detailModalBeat.nonExclusiveEnabled && 
      (detailModalBeat.nonExclusiveCap === null || (detailModalBeat.nonExclusiveSold || 0) < detailModalBeat.nonExclusiveCap);
      
    if (!nonExclAvailable && detailModalBeat.exclusiveEnabled && !detailModalBeat.exclusiveSold) {
      setSelectedLicense("exclusive");
    } else {
      setSelectedLicense("non-exclusive");
    }
  }, [detailModalBeat]);

  // Waveform interaction handlers - MUST be defined before any conditional returns
  const handleWaveMove = useCallback((e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!waveContainerRef.current || duration === 0 || !detailModalBeat) return;

    const rect = waveContainerRef.current.getBoundingClientRect();
    const clientX = 'clientX' in e ? e.clientX : 0;
    const clickX = clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, clickX / width));
    
    seek(pct * duration);
  }, [duration, seek, detailModalBeat]);

  const handleWaveStart = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveContainerRef.current || !detailModalBeat) return;
    
    const isCurrentPlaying = activeBeat?.id === detailModalBeat.id;
    
    // Start playing if not active yet
    if (!isCurrentPlaying) {
      playBeat(detailModalBeat);
    }
    
    setIsDraggingWaveform(true);
    handleWaveMove(e);
  }, [detailModalBeat, activeBeat?.id, playBeat, handleWaveMove]);

  const handleWaveHover = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveContainerRef.current || duration === 0 || !detailModalBeat) return;

    const rect = waveContainerRef.current.getBoundingClientRect();
    const hoverX = e.clientX - rect.left;
    const width = rect.width;
    const pct = Math.max(0, Math.min(1, hoverX / width));
    
    setHoverPercent(pct * 100);
    setHoverTime(pct * duration);
  }, [duration, detailModalBeat]);

  const handleWaveLeave = useCallback(() => {
    setHoverTime(null);
  }, []);

  // Close modal on Escape - MUST be called before any returns
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetailModalBeat(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setDetailModalBeat]);

  // Global drag listeners useEffect
  useEffect(() => {
    if (!isDraggingWaveform) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleWaveMove(e);
    };

    const handleGlobalMouseUp = () => {
      setIsDraggingWaveform(false);
    };

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [isDraggingWaveform, duration, handleWaveMove]);

  const isCurrentPlaying = activeBeat?.id === detailModalBeat?.id;

  // Generate 60 static height bars representing a pre-generated waveform based on beat ID
  const generateWaveformHeights = (id: string) => {
    const seed = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const heights: number[] = [];
    for (let i = 0; i < 60; i++) {
      // Deterministic pseudo-random heights between 15% and 85%
      const val = Math.abs(Math.sin(seed + i * 0.25) * 70 + 15);
      heights.push(Math.round(val));
    }
    return heights;
  };

  const baseHeights = React.useMemo(() => generateWaveformHeights(detailModalBeat?.id || "fallback"), [detailModalBeat?.id]);
  const [liveHeights, setLiveHeights] = useState<number[]>(baseHeights);

  useEffect(() => {
    if (!audioAnalyzer || !isPlaying || !isCurrentPlaying) {
      setLiveHeights(baseHeights);
      return;
    }

    const dataArray = new Uint8Array(audioAnalyzer.frequencyBinCount);
    let animationId: number;

    const animate = () => {
      audioAnalyzer.getByteFrequencyData(dataArray);
      
      const newHeights: number[] = [];
      const step = Math.floor(dataArray.length / 60);
      
      for (let i = 0; i < 60; i++) {
        let sum = 0;
        let count = 0;
        for (let j = 0; j < step && i * step + j < dataArray.length; j++) {
           sum += dataArray[i * step + j];
           count++;
        }
        const avg = count > 0 ? sum / count : 0;
        
        // Base structure + frequency bump (up to 80% extra)
        const bump = Math.pow(avg / 255, 1.5) * 80; 
        const finalHeight = Math.min(100, Math.max(10, baseHeights[i] * 0.3 + bump));
        newHeights.push(Math.round(finalHeight));
      }
      
      setLiveHeights(newHeights);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [audioAnalyzer, isPlaying, isCurrentPlaying, baseHeights]);

  // If modal closed, return null (AFTER all hooks are called)
  if (!detailModalBeat) return null;

  const handleDownload = () => {
    showToast(`Downloading free MP3 preview: ${detailModalBeat.title}`, "success");
    const link = document.createElement("a");
    link.href = detailModalBeat.mp3Url;
    link.setAttribute("download", `${detailModalBeat.title} - Preview.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCheckoutSubmit = () => {
    setDetailModalBeat(null);
    openCheckout(detailModalBeat, selectedLicense);
  };

  const activeProgressPct = isCurrentPlaying && duration > 0 ? currentTime / duration : 0;

  return (
    <div 
      className="modal-overlay"
      onClick={() => setDetailModalBeat(null)}
    >
      <div 
        className="modal-panel max-w-[640px] w-full"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="beat-details-title"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-border-subtle pb-4 mb-5">
          <span id="beat-details-title" className="font-syne font-medium text-[16px] text-text-primary uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4 text-text-secondary" />
            Beat Details
          </span>
          <button 
            onClick={() => setDetailModalBeat(null)}
            className="btn-icon w-8 h-8 rounded-md border border-border-strong hover:border-border-focus"
            aria-label="Close modal (Esc)"
            title="Close modal (Esc)"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        </div>

        {/* Error Banner */}
        {audioError && (
          <div 
            className="flex items-center justify-between gap-4 mb-4 px-3 py-2 bg-danger/10 border border-danger/20 text-danger-fg rounded-lg"
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

        {/* Top Section: Artwork & Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 mb-6">
          <div className="sm:col-span-4 flex justify-center">
            <div 
              className={`w-full max-w-[160px] aspect-square rounded-lg bg-gradient-to-br ${detailModalBeat.coverColor} flex items-center justify-center border border-border-default shadow-md overflow-hidden relative`}
            >
              {detailModalBeat.coverUrl ? (
                <img src={detailModalBeat.coverUrl} alt={detailModalBeat.title} className="w-full h-full object-cover" />
              ) : (
                <Disc className={`w-12 h-12 text-text-secondary/50 ${isCurrentPlaying && isPlaying ? "animate-[spin_6s_linear_infinite]" : ""}`} />
              )}
            </div>
          </div>

          <div className="sm:col-span-8 flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h2 className="font-syne font-bold text-[22px] leading-tight text-text-primary">
                {detailModalBeat.title}
              </h2>
              {detailModalBeat.exclusiveSold && (
                <span className="badge badge-danger uppercase">Exclusive Sold</span>
              )}
            </div>

            <div className="font-mono text-[13px] text-text-secondary mb-3 uppercase tracking-wider">
              {detailModalBeat.genre} · {detailModalBeat.bpm} BPM · {detailModalBeat.key}
            </div>

            {/* Mood tags */}
            <div className="flex flex-wrap gap-1.5">
              {detailModalBeat.tags.map((tag, index) => (
                <span 
                  key={`${tag}-${index}`} 
                  className="text-[11px] bg-bg-overlay border border-border-subtle text-text-secondary px-2.5 py-0.5 rounded-[var(--radius-sm)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Audio Waveform Interactive Player Section */}
        <div className="bg-bg-elevated border border-border-default rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => isCurrentPlaying ? togglePlayPause() : playBeat(detailModalBeat)}
              className="w-10 h-10 rounded-full bg-accent text-accent-fg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              aria-label={isCurrentPlaying && isPlaying ? "Pause preview" : "Play preview"}
              aria-pressed={isCurrentPlaying && isPlaying}
              title={isCurrentPlaying && isPlaying ? "Pause (Space)" : "Play (Space)"}
            >
              {isCurrentPlaying && isPlaying ? (
                <Pause className="w-4 h-4 fill-current text-accent-fg" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-[1px] text-accent-fg" />
              )}
            </button>
            <div>
              <span className="font-syne font-medium text-[13px] text-text-primary">
                {isCurrentPlaying ? (isPlaying ? "Now Playing Preview" : "Preview Paused") : "Listen to Preview"}
              </span>
              <p className="font-mono text-[10px] text-text-muted" aria-live="polite">
                {isCurrentPlaying ? `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, "0")} / ${Math.floor(duration / 60) || 0}:${String(Math.floor(duration % 60) || 0).padStart(2, "0")}` : "0:00 / 0:00"}
              </p>
            </div>
            {isAudioLoading && (
              <span className="text-xs text-text-secondary ml-auto animate-pulse">Loading...</span>
            )}
            <button
              onClick={toggleRepeatMode}
              disabled={!isCurrentPlaying}
              className={`ml-auto p-1.5 text-text-secondary disabled:text-text-disabled disabled:opacity-40 transition-colors rounded ${
                repeatMode !== "off" && isCurrentPlaying ? "text-accent" : ""
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

          {/* Interactive Waveform container */}
          <div 
            ref={waveContainerRef}
            onMouseDown={handleWaveStart}
            onMouseMove={handleWaveHover}
            onMouseLeave={handleWaveLeave}
            className={`h-[48px] w-full flex items-end justify-between cursor-pointer relative group ${isAudioLoading ? 'opacity-60' : ''} ${isDraggingWaveform ? 'h-[54px]' : ''}`}
            role="slider"
            aria-label="Waveform seek bar"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 0}
            aria-valuenow={Math.round(currentTime) || 0}
            aria-valuetext={`${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, "0")} / ${Math.floor(duration / 60) || 0}:${String(Math.floor(duration % 60) || 0).padStart(2, "0")}`}
            title="Click and drag to seek playback"
          >
            {liveHeights.map((ht, idx) => {
              const barProgress = idx / 60;
              const isPlayed = barProgress <= activeProgressPct;
              return (
                <div
                  key={idx}
                  className="w-[1.2%] rounded-[1px] transition-all duration-75"
                  style={{
                    height: `${ht}%`,
                    backgroundColor: isPlayed 
                      ? "var(--waveform-played)" 
                      : "var(--waveform-unplayed)"
                  }}
                />
              );
            })}

            {/* Hover Time Preview */}
            {hoverTime !== null && !isDraggingWaveform && (
              <div 
                className="absolute bottom-full mb-2 -translate-x-1/2 bg-bg-elevated border border-border-default rounded px-2 py-1 text-[10px] text-text-secondary font-mono whitespace-nowrap pointer-events-none z-10"
                style={{ left: `${hoverPercent}%` }}
              >
                {Math.floor(hoverTime / 60)}:{String(Math.floor(hoverTime % 60)).padStart(2, "0")}
              </div>
            )}
          </div>

          {/* Drag Preview Below Waveform */}
          {hoverTime !== null && isDraggingWaveform && (
            <div className="flex justify-center mt-2 mb-2">
              <div className="bg-bg-elevated border border-border-default rounded px-2 py-1 text-[11px] text-text-secondary font-mono">
                {Math.floor(hoverTime / 60)}:{String(Math.floor(hoverTime % 60)).padStart(2, "0")}
              </div>
            </div>
          )}
        </div>

        {/* Choose a License Section */}
        {!detailModalBeat.exclusiveSold && (
          <div className="mb-6">
            <h3 className="font-syne font-medium text-[13px] text-text-primary uppercase tracking-wider mb-3">
              Choose a license
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Non-Exclusive Option */}
              {detailModalBeat.nonExclusiveEnabled && 
               (detailModalBeat.nonExclusiveCap === null || (detailModalBeat.nonExclusiveSold || 0) < detailModalBeat.nonExclusiveCap) && (
                <div 
                  onClick={() => setSelectedLicense("non-exclusive")}
                  className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                    selectedLicense === "non-exclusive" 
                      ? "border-2 border-accent bg-bg-hover" 
                      : "border-border-default bg-transparent hover:border-border-focus"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-syne font-medium text-[14px] text-text-primary">
                        Non-Exclusive
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mb-4 leading-snug">
                      Perfect for streaming, YouTube, and mixtapes. Cap at 50,000 streams.
                    </p>
                  </div>
                  <div>
                    <div className="font-syne font-bold text-[20px] text-text-primary mb-2">
                      ${detailModalBeat.nonExclusivePrice.toFixed(2)}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLicense("non-exclusive");
                      }}
                      className={`w-full py-1.5 text-[11px] font-syne uppercase rounded-md transition-all ${
                        selectedLicense === "non-exclusive"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      {selectedLicense === "non-exclusive" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              )}

              {/* Exclusive Option */}
              {detailModalBeat.exclusiveEnabled && (
                <div 
                  onClick={() => setSelectedLicense("exclusive")}
                  className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition-all ${
                    selectedLicense === "exclusive" 
                      ? "border-2 border-accent bg-bg-hover" 
                      : "border-border-default bg-transparent hover:border-border-focus"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-syne font-medium text-[14px] text-text-primary">
                        Exclusive Ownership
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary mb-3 leading-snug">
                      Uncapped usage, sole contract ownership. Beat removed from store forever.
                    </p>
                  </div>
                  <div>
                    <div className="font-syne font-bold text-[20px] text-text-primary">
                      ${detailModalBeat.exclusivePrice.toFixed(2)}
                    </div>
                    {(detailModalBeat.nonExclusiveSold ?? 0) > 0 && (
                      <span className="font-mono text-[9px] text-success-text block mb-2 mt-0.5">
                        {detailModalBeat.nonExclusiveSold} non-exclusive sold already
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLicense("exclusive");
                      }}
                      className={`w-full py-1.5 text-[11px] font-syne uppercase rounded-md transition-all ${
                        selectedLicense === "exclusive"
                          ? "btn-primary"
                          : "btn-secondary"
                      }`}
                    >
                      {selectedLicense === "exclusive" ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-border-subtle mt-4">
          <button
            onClick={handleDownload}
            className="btn-secondary w-full sm:w-auto h-10 px-5 flex items-center justify-center gap-2 text-[12px]"
            aria-label="Download free MP3 preview"
            title="Download free MP3 preview"
          >
            <Download className="w-4 h-4" />
            FREE PREVIEW MP3
          </button>
          
          {detailModalBeat.exclusiveSold ? (
            <button
              disabled
              className="btn-secondary h-10 w-full flex-1 opacity-50 cursor-not-allowed uppercase text-[12px] font-medium"
              aria-disabled="true"
              aria-label="Exclusive license sold out"
            >
              EXCLUSIVE SOLD OUT
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:flex-1">
              <button
                onClick={() => {
                  addToCart(detailModalBeat, selectedLicense);
                  setDetailModalBeat(null);
                  setIsCartOpen(true);
                }}
                className="btn-secondary h-10 flex-1 flex items-center justify-center gap-2 text-[12px] uppercase font-medium border border-border-strong hover:border-border-focus"
                aria-label={`Add to cart with ${selectedLicense === "non-exclusive" ? "non-exclusive" : "exclusive"} license`}
              >
                <ShoppingCart className="w-4 h-4" />
                ADD TO CART
              </button>
              <button
                onClick={handleCheckoutSubmit}
                className="btn-primary h-10 flex-1 flex items-center justify-center gap-2 text-[12px] uppercase font-medium"
                aria-label={`Proceed to checkout with ${selectedLicense === "non-exclusive" ? "non-exclusive" : "exclusive"} license`}
                title="Proceed to checkout"
              >
                <ShoppingBag className="w-4 h-4" />
                BUY NOW
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
