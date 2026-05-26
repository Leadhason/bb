"use client";

import React from "react";
import { useStore, Beat } from "../context/StoreContext";
import { 
  Play, 
  Pause, 
  Search, 
  Grid, 
  List, 
  Download, 
  ShoppingBag, 
  X, 
  Disc,
  Music,
  SlidersHorizontal,
  ChevronDown
} from "lucide-react";

export default function BeatCatalogue({ beats }: { beats: Beat[] }) {
  const {
    setAllBeats,
    view,
    setView,
    searchQuery,
    setSearchQuery,
    selectedGenre,
    setSelectedGenre,
    selectedBpm,
    setSelectedBpm,
    selectedKey,
    setSelectedKey,
    selectedMoods,
    toggleMood,
    sortBy,
    setSortBy,
    clearFilters,
    activeFilterCount,
    
    activeBeat,
    isPlaying,
    playBeat,
    pauseBeat,
    setDetailModalBeat,
    openCheckout,
    showToast
  } = useStore();

  // Populate context with beats for skip navigation
  React.useEffect(() => {
    setAllBeats(beats);
  }, [beats, setAllBeats]);

  // BPM filter parser
  const matchBpmRange = (beatBpm: number, rangeStr: string) => {
    if (rangeStr === "Any BPM") return true;
    if (rangeStr === "60–90") return beatBpm >= 60 && beatBpm <= 90;
    if (rangeStr === "90–120") return beatBpm >= 90 && beatBpm <= 120;
    if (rangeStr === "120–140") return beatBpm >= 120 && beatBpm <= 140;
    if (rangeStr === "140–160") return beatBpm >= 140 && beatBpm <= 160;
    if (rangeStr === "160+") return beatBpm >= 160;
    return true;
  };

  // Filter beats
  const filteredBeats = beats.filter((beat) => {
    // Search query match
    const matchesSearch = beat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          beat.genre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          beat.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Genre match
    const matchesGenre = selectedGenre === "All genres" || beat.genre === selectedGenre;

    // BPM match
    const matchesBpm = matchBpmRange(beat.bpm, selectedBpm);

    // Key match
    const matchesKey = selectedKey === "Any key" || beat.key.toLowerCase().includes(selectedKey.toLowerCase());

    // Moods multi-select match (all must match if selected)
    const matchesMoods = selectedMoods.length === 0 || selectedMoods.every(mood => beat.tags.includes(mood));

    return matchesSearch && matchesGenre && matchesBpm && matchesKey && matchesMoods;
  });

  // Sort beats
  const sortedBeats = [...filteredBeats].sort((a, b) => {
    if (sortBy === "Newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === "Oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === "Price: Low to High") {
      return a.nonExclusivePrice - b.nonExclusivePrice;
    }
    if (sortBy === "Price: High to Low") {
      return b.nonExclusivePrice - a.nonExclusivePrice;
    }
    return 0; // Default or most previewed fallback
  });

  // Handle preview play trigger
  const handlePlayTrigger = (e: React.MouseEvent, beat: Beat) => {
    e.stopPropagation();
    if (activeBeat?.id === beat.id && isPlaying) {
      pauseBeat();
    } else {
      playBeat(beat);
    }
  };

  // Handle MP3 Free Download trigger
  const handleFreeDownload = (e: React.MouseEvent, beat: Beat) => {
    e.stopPropagation();
    showToast(`Downloading free MP3 preview: ${beat.title}`, "success");
    const link = document.createElement("a");
    link.href = beat.mp3Url;
    link.setAttribute("download", `${beat.title} - Preview.mp3`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const genres = ["All genres", "UK Drill", "Trap", "Hip Hop"];
  const bpms = ["Any BPM", "60–90", "90–120", "120–140", "140–160", "160+"];
  const keys = ["Any key", "A Minor", "C Minor", "D# Minor", "E Minor", "F Minor", "G Minor"];
  const moods = ["Dark", "Melodic", "Aggressive", "Chill", "Cinematic"];
  const sorts = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low"];

  return (
    <div className="w-full flex flex-col pt-4 animate-fadeIn">
      {/* Filter Bar */}
      <div className="sticky top-[60px] z-30 bg-bg-base border-b border-border-subtle py-3 mb-6 flex flex-col gap-3">
        {/* Top filter row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search beat, key, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-9 h-9 text-[12px] bg-bg-surface"
            />
          </div>

          {/* Genre select */}
          <div className="relative min-w-[110px]">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="input h-9 text-[12px] bg-bg-surface pr-8 appearance-none cursor-pointer"
            >
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* BPM select */}
          <div className="relative min-w-[110px]">
            <select
              value={selectedBpm}
              onChange={(e) => setSelectedBpm(e.target.value)}
              className="input h-9 text-[12px] bg-bg-surface pr-8 appearance-none cursor-pointer"
            >
              {bpms.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Key select */}
          <div className="relative min-w-[110px]">
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="input h-9 text-[12px] bg-bg-surface pr-8 appearance-none cursor-pointer"
            >
              {keys.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Sort select */}
          <div className="relative min-w-[130px] ml-auto sm:ml-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input h-9 text-[12px] bg-bg-surface pr-8 appearance-none cursor-pointer"
            >
              {sorts.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* Clear button if filters are active */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="btn-ghost h-9 text-[11px] font-syne uppercase text-text-muted hover:text-text-primary px-3 border border-dashed border-border-strong rounded-md flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Clear [{activeFilterCount}]
            </button>
          )}

          {/* Spacer */}
          <div className="hidden lg:flex flex-1" />

          {/* Grid/List toggles */}
          <div className="flex border border-border-strong rounded-md overflow-hidden bg-bg-surface p-0.5 ml-auto sm:ml-0 flex-shrink-0">
            <button
              onClick={() => setView("list")}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                view === "list" 
                  ? "bg-bg-elevated text-text-primary border border-border-default" 
                  : "text-text-muted hover:text-text-secondary"
              }`}
              aria-label="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("grid")}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors ${
                view === "grid" 
                  ? "bg-bg-elevated text-text-primary border border-border-default" 
                  : "text-text-muted hover:text-text-secondary"
              }`}
              aria-label="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mood pills multi-select */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border-subtle/50">
          <span className="font-mono text-[10px] text-text-muted mr-1 uppercase tracking-wider">Mood Tags:</span>
          {moods.map((mood) => {
            const isActive = selectedMoods.includes(mood);
            return (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`text-[11px] px-3 py-1 rounded-[var(--radius-full)] font-syne transition-all cursor-pointer ${
                  isActive
                    ? "bg-text-primary text-bg-base border border-text-primary font-medium"
                    : "bg-bg-surface border border-border-default text-text-secondary hover:border-border-focus"
                }`}
              >
                {mood}
              </button>
            );
          })}
        </div>
      </div>

      {/* No Beats Found State */}
      {sortedBeats.length === 0 && (
        <div className="text-center py-20 bg-bg-surface border border-border-default rounded-xl">
          <SlidersHorizontal className="w-8 h-8 text-text-disabled mx-auto mb-4" />
          <h3 className="font-syne font-semibold text-[15px] text-text-primary">
            No beats match your filters
          </h3>
          <p className="text-[12px] text-text-muted mt-1 mb-6">
            Try adjusting filters or typing alternative searches.
          </p>
          <button 
            onClick={clearFilters}
            className="btn-primary uppercase text-[11px] font-syne h-9 px-5"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* RENDER LIST VIEW */}
      {view === "list" && sortedBeats.length > 0 && (
        <div className="w-full flex flex-col border border-border-default rounded-xl overflow-hidden bg-bg-surface shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-[36px_44px_1fr_80px_70px_110px_130px] gap-4 items-center bg-bg-elevated border-b border-border-default px-5 py-3 select-none">
            <div></div>
            <div></div>
            <span className="font-syne text-[11px] text-text-muted uppercase tracking-wider font-semibold">TITLE</span>
            <span className="font-syne text-[11px] text-text-muted uppercase tracking-wider font-semibold text-center">BPM</span>
            <span className="font-syne text-[11px] text-text-muted uppercase tracking-wider font-semibold text-center">KEY</span>
            <span className="font-syne text-[11px] text-text-muted uppercase tracking-wider font-semibold">LICENSES</span>
            <div></div>
          </div>

          {/* Table Rows */}
          <div className="flex flex-col">
            {sortedBeats.map((beat) => {
              const isCurrent = activeBeat?.id === beat.id;
              const isPlayingCurrent = isCurrent && isPlaying;
              
              return (
                <div
                  key={beat.id}
                  onClick={() => setDetailModalBeat(beat)}
                  className={`grid grid-cols-[36px_44px_1fr_80px_70px_110px_130px] gap-4 items-center px-5 py-3 border-b border-border-subtle cursor-pointer transition-all duration-100 ${
                    beat.exclusiveSold 
                      ? "opacity-50 hover:bg-transparent" 
                      : isCurrent 
                      ? "bg-bg-elevated/75 border-l-2 border-l-text-primary" 
                      : "hover:bg-bg-hover"
                  } last:border-b-0`}
                >
                  {/* Play circle trigger */}
                  <div className="flex justify-center">
                    <button
                      onClick={(e) => handlePlayTrigger(e, beat)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                        isPlayingCurrent 
                          ? "bg-text-primary border-text-primary text-bg-base" 
                          : isCurrent 
                          ? "bg-bg-overlay border-text-secondary text-text-primary"
                          : "border-border-strong hover:border-border-focus bg-transparent text-text-muted"
                      }`}
                      aria-label={isPlayingCurrent ? "Pause Preview" : "Play Preview"}
                    >
                      {isPlayingCurrent ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-[0.5px]" />
                      )}
                    </button>
                  </div>

                  {/* Artwork */}
                  <div>
                    <div 
                      className={`w-10 h-10 rounded-md bg-gradient-to-br ${beat.coverColor} border border-border-default flex items-center justify-center shadow-inner overflow-hidden relative`}
                    >
                      <Music className="w-4.5 h-4.5 text-text-secondary/40" />
                    </div>
                  </div>

                  {/* Title and tags */}
                  <div className="min-w-0">
                    <h3 className="font-syne font-semibold text-[13px] sm:text-[14px] text-text-primary truncate leading-snug">
                      {beat.title}
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {beat.tags.slice(0, 3).map((tag: string) => (
                        <span 
                          key={tag} 
                          className="text-[9px] bg-bg-overlay text-text-secondary border border-border-subtle px-1.5 py-0.2 rounded-[2px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* BPM */}
                  <div className="font-mono text-[12px] text-text-secondary text-center">
                    {beat.bpm}
                  </div>

                  {/* Key */}
                  <div className="font-mono text-[12px] text-text-secondary text-center whitespace-nowrap">
                    {beat.key}
                  </div>

                  {/* Pricing and badges */}
                  <div className="flex flex-col">
                    {beat.exclusiveSold ? (
                      <span className="badge badge-danger text-[9px] w-fit">SOLD OUT</span>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-text-muted font-mono uppercase">Non-excl:</span>
                          <span className="font-syne font-semibold text-[12px] text-text-primary">${beat.nonExclusivePrice.toFixed(2)}</span>
                        </div>
                        {beat.nonExclusiveCap && (beat.nonExclusiveSold ?? 0) >= (beat.nonExclusiveCap * 0.8) ? (
                          <span className="badge badge-warning text-[9px] mt-1 w-fit leading-none px-1.5 py-0.5">
                            CAP {beat.nonExclusiveSold ?? 0}/{beat.nonExclusiveCap}
                          </span>
                        ) : null}
                        {beat.exclusiveEnabled && (
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-text-muted font-mono uppercase">Excl:</span>
                            <span className="font-mono text-[10px] text-text-secondary">${beat.exclusivePrice.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleFreeDownload(e, beat)}
                      className="btn-icon w-8 h-8 rounded-md border border-border-strong text-text-secondary hover:text-text-primary hover:border-border-focus"
                      title="Download Free Preview MP3"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {beat.exclusiveSold ? (
                      <button
                        disabled
                        className="btn-secondary h-8 text-[11px] text-text-disabled uppercase font-medium bg-bg-elevated border border-border-subtle cursor-not-allowed flex-1"
                      >
                        Sold
                      </button>
                    ) : (
                      <button
                        onClick={() => openCheckout(beat, "non-exclusive")}
                        className="btn-primary h-8 px-3 text-[11px] uppercase font-syne font-medium flex items-center justify-center gap-1 flex-1 shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Buy
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RENDER GRID VIEW */}
      {view === "grid" && sortedBeats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {sortedBeats.map((beat) => {
            const isCurrent = activeBeat?.id === beat.id;
            const isPlayingCurrent = isCurrent && isPlaying;

            return (
              <div
                key={beat.id}
                onClick={() => setDetailModalBeat(beat)}
                className={`bg-bg-surface border border-border-default rounded-xl overflow-hidden cursor-pointer flex flex-col group transition-all ${
                  beat.exclusiveSold ? "opacity-55" : "hover:border-border-strong shadow-sm hover:shadow-md"
                }`}
              >
                {/* Artwork Area */}
                <div className="relative aspect-square w-full bg-bg-elevated flex items-center justify-center overflow-hidden border-b border-border-default">
                  {/* High quality CSS color mesh */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${beat.coverColor}`} />
                  
                  <Disc className={`absolute w-16 h-16 text-text-secondary/30 ${isPlayingCurrent ? "animate-[spin_6s_linear_infinite]" : ""}`} />

                  {/* BPM overlay in Mono */}
                  <div className="absolute bottom-3 right-3 bg-black/65 font-mono text-[10px] text-white px-2 py-0.5 rounded-[var(--radius-sm)]">
                    {beat.bpm} BPM
                  </div>

                  {/* Play Circle Overlay on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button
                      onClick={(e) => handlePlayTrigger(e, beat)}
                      className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg"
                    >
                      {isPlayingCurrent ? (
                        <Pause className="w-5 h-5 fill-current text-black" />
                      ) : (
                        <Play className="w-5 h-5 fill-current text-black translate-x-[1px]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-syne font-semibold text-[14px] text-text-primary group-hover:text-accent truncate leading-snug">
                      {beat.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[11px] font-mono text-text-muted uppercase">
                      <span>{beat.genre}</span>
                      <span>{beat.key}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border-subtle flex flex-col gap-2">
                    {/* Pricing details */}
                    <div className="flex justify-between items-end">
                      {beat.exclusiveSold ? (
                        <span className="badge badge-danger text-[9px] leading-none uppercase">Sold Out</span>
                      ) : (
                        <>
                          <div>
                            <span className="text-[9px] text-text-muted font-mono uppercase block">Non-exclusive</span>
                            <span className="font-syne font-bold text-[16px] text-text-primary">${beat.nonExclusivePrice.toFixed(2)}</span>
                          </div>
                          {beat.exclusiveEnabled && (
                            <div className="text-right">
                              <span className="text-[9px] text-text-muted font-mono uppercase block">Exclusive</span>
                              <span className="font-mono text-[11px] text-text-secondary">${beat.exclusivePrice.toFixed(2)}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleFreeDownload(e, beat)}
                        className="btn-icon w-9 h-9 rounded-md border border-border-strong text-text-secondary hover:text-text-primary hover:border-border-focus"
                        title="Download Free Preview MP3"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {beat.exclusiveSold ? (
                        <button
                          disabled
                          className="btn-secondary h-9 text-[11px] uppercase text-text-disabled cursor-not-allowed flex-1 font-medium bg-bg-elevated border border-border-subtle"
                        >
                          Sold Out
                        </button>
                      ) : (
                        <button
                          onClick={() => openCheckout(beat, "non-exclusive")}
                          className="btn-primary h-9 flex-1 flex items-center justify-center gap-1.5 text-[11px] uppercase font-syne font-medium shadow-sm"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Buy
                        </button>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
