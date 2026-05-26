"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useId } from "react";

export interface Beat {
  id: string;
  title: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  coverUrl: string;
  coverColor?: string; // gradient colors like "from-neutral-800 to-neutral-900"
  mp3Url: string;
  wavUrl: string;
  nonExclusiveEnabled: boolean;
  nonExclusivePrice: number;
  nonExclusiveCap: number | null;
  nonExclusiveSold?: number; // tracks how many non-exclusive licenses sold
  exclusiveEnabled: boolean;
  exclusivePrice: number;
  exclusiveSold: boolean;
  published: boolean;
  createdAt: string;
}

type Theme = "dark" | "light";

export type LicenseType = "non-exclusive" | "exclusive";

export interface CheckoutState {
  isOpen: boolean;
  beat: Beat | null;
  licenseType: LicenseType;
  step: 1 | 2 | 3 | 4; // 1: Confirmation, 2: Customer Details, 3: Payment, 4: Success
  discountCode: string;
  discountApplied: boolean;
  discountPercentage: number;
  discountError: string;
  customerName: string;
  customerEmail: string;
  createAccount: boolean;
  orderRef: string;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "neutral";
}

interface StoreContextType {
  // Beats data
  allBeats: Beat[];
  setAllBeats: (beats: Beat[]) => void;

  // Theme state
  theme: Theme;
  toggleTheme: () => void;

  // Catalog view state
  view: "list" | "grid";
  setView: (view: "list" | "grid") => void;

  // Filter & Search states
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedBpm: string;
  setSelectedBpm: (bpm: string) => void;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  selectedMoods: string[];
  toggleMood: (mood: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;

  // Audio playback state
  activeBeat: Beat | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isAudioLoading: boolean;
  audioError: string | null;
  repeatMode: "off" | "one" | "all";
  playBeat: (beat: Beat) => void;
  pauseBeat: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolumeState: (vol: number) => void;
  skipNext: () => void;
  skipPrevious: () => void;
  toggleRepeatMode: () => void;
  clearAudioError: () => void;

  // Phase 3: Web Audio visualizer
  audioAnalyzer: AnalyserNode | null;

  // Modal states
  detailModalBeat: Beat | null;
  setDetailModalBeat: (beat: Beat | null) => void;

  // Checkout states
  checkout: CheckoutState;
  openCheckout: (beat: Beat, licenseType?: LicenseType) => void;
  closeCheckout: () => void;
  setCheckoutStep: (step: 1 | 2 | 3 | 4) => void;
  applyDiscount: (code: string) => void;
  updateCheckoutDetails: (fields: Partial<CheckoutState>) => void;
  resetCheckout: () => void;
  completeCheckout: () => void;

  // Toast notifications
  toasts: Toast[];
  showToast: (message: string, type?: "success" | "error" | "neutral") => void;
  dismissToast: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children, initialBeats = [] }: { children: React.ReactNode; initialBeats?: Beat[] }) {
  // Beats state
  const [allBeats, setAllBeats] = useState<Beat[]>(initialBeats);

  // Theme state - initialize from localStorage
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("beat-store-theme") as Theme | null;
      if (saved && (saved === "dark" || saved === "light")) {
        return saved;
      }
    }
    return "dark";
  });

  // View state
  const [view, setView] = useState<"list" | "grid">("list");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All genres");
  const [selectedBpm, setSelectedBpm] = useState("Any BPM");
  const [selectedKey, setSelectedKey] = useState("Any key");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");

  // Audio Playback state
  const [activeBeat, setActiveBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [repeatMode, setRepeatMode] = useState<"off" | "one" | "all">("off");
  const [volume, setVolume] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("beat-store-volume");
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) return parsed;
      }
    }
    return 0.8;
  });

  // Phase 3: Web Audio
  const [audioAnalyzer, setAudioAnalyzer] = useState<AnalyserNode | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const lastPlayedRef = useRef<string | null>(null);

  // Modal states
  const [detailModalBeat, setDetailModalBeat] = useState<Beat | null>(null);

  // Checkout state
  const [checkout, setCheckout] = useState<CheckoutState>({
    isOpen: false,
    beat: null,
    licenseType: "non-exclusive",
    step: 1,
    discountCode: "",
    discountApplied: false,
    discountPercentage: 0,
    discountError: "",
    customerName: "",
    customerEmail: "",
    createAccount: false,
    orderRef: "",
  });

  // Toasts state
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastCounterRef = useRef(0);

  const toastIdGenerator = useId();

  // Apply theme to document on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("beat-store-theme", theme);
  }, [theme]);

  // Theme Toggle function
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("beat-store-theme", nextTheme);
    showToast(`Switched to ${nextTheme} theme`, "neutral");
  };

  // Toast Helper
  const showToast = useCallback((message: string, type: "success" | "error" | "neutral" = "neutral") => {
    toastCounterRef.current += 1;
    const id = `${toastIdGenerator}-${toastCounterRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, [toastIdGenerator]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Skip functions - defined early since they're needed in audio effect
  const skipNext = useCallback(() => {
    setActiveBeat((current) => {
      if (!current || allBeats.length === 0) return current;
      const currentIndex = allBeats.findIndex((b) => b.id === current.id);
      if (currentIndex === -1) return current;
      
      const nextIndex = (currentIndex + 1) % allBeats.length;
      const nextBeat = allBeats[nextIndex];
      return nextBeat;
    });
  }, [allBeats]);

  const skipPrevious = useCallback(() => {
    setActiveBeat((current) => {
      if (!current || allBeats.length === 0) return current;
      const currentIndex = allBeats.findIndex((b) => b.id === current.id);
      if (currentIndex === -1) return current;

      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = allBeats.length - 1;
      return allBeats[prevIndex];
    });
  }, [allBeats]);

  // Audio & Web Audio setup
  useEffect(() => {
    if (audioRef.current) return; // Only run once

    const audio = new Audio();
    // audio.crossOrigin = "anonymous"; // Temporarily disabled to allow SoundHelix dummy data to play. Must be enabled for Supabase & Web Audio API to work.
    audio.volume = volume;
    audioRef.current = audio;

    if (typeof AudioContext !== "undefined") {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256; // 128 frequency bands
        
        if (audioContext.createMediaElementAudioSource) {
          const source = audioContext.createMediaElementAudioSource(audio);
          source.connect(analyser);
          analyser.connect(audioContext.destination);
        }

        setAudioAnalyzer(analyser);
      } catch (error) {
        console.warn("Web Audio API unavailable:", error);
      }
    }
  }, []);

  // Audio Event Listeners (Attach/Detach on dependency change without recreating audio object)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => {
      setIsPlaying(true);
      setIsAudioLoading(false);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (repeatMode === "one") {
        // Replay current song
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        // Skip to next (both "off" and "all" modes)
        setIsPlaying(false);
        setCurrentTime(0);
        skipNext();
      }
    };
    const handleLoadStart = () => setIsAudioLoading(true);
    const handleCanPlay = () => setIsAudioLoading(false);
    const handleError = () => {
      const errorCode = audio.error?.code;
      let message = "Failed to load audio";
      switch (errorCode) {
        case 1:
          message = "Audio loading aborted";
          break;
        case 2:
          message = "Network error while loading audio";
          break;
        case 3:
          message = "Audio decoding failed";
          break;
        case 4:
          message = "Unsupported audio format";
          break;
      }
      setAudioError(message);
      setIsPlaying(false);
      setIsAudioLoading(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
    };
  }, [skipNext, repeatMode]);

  // Volume synchronization and persistence
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    localStorage.setItem("beat-store-volume", volume.toString());
  }, [volume]);

  // Handle active beat URL changes and playback state
  useEffect(() => {
    if (!audioRef.current || !activeBeat) {
      // Stop playback if no active beat
      if (audioRef.current && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      return;
    }

    const audio = audioRef.current;
    let isMounted = true;

    // Update source if different
    const isCurrentSrc = audio.src === activeBeat.mp3Url;
    if (!isCurrentSrc) {
      audio.src = activeBeat.mp3Url;
      audio.load();
      setCurrentTime(0);
      setAudioError(null);
    }

    // Handle playback state
    if (isPlaying) {
      // Only play if still mounted (avoid race conditions)
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .catch((err) => {
            // Ignore abort errors from pause() calls - they're expected
            if (err.name !== "AbortError") {
              const errorMsg = `Playback error: ${err.message}`;
              if (isMounted) {
                setAudioError(errorMsg);
                setIsPlaying(false);
                showToast(errorMsg, "error");
              }
            }
          });
      }
    } else {
      // Ensure audio is paused if not playing
      audio.pause();
    }

    return () => {
      isMounted = false;
    };
  }, [activeBeat, isPlaying, showToast]);

  // Audio triggers
  const playBeat = useCallback((beat: Beat) => {
    if (activeBeat?.id === beat.id) {
      setIsPlaying(true);
    } else {
      setActiveBeat(beat);
      setIsPlaying(true);
    }
  }, [activeBeat?.id]);

  const pauseBeat = useCallback(() => {
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!activeBeat) {
      // play the first beat if none is active
      const first = allBeats.find((b) => b.published && !b.exclusiveSold) || allBeats[0];
      if (first) playBeat(first);
    } else if (isPlaying) {
      pauseBeat();
    } else {
      setIsPlaying(true);
    }
  }, [activeBeat, isPlaying, allBeats, playBeat, pauseBeat]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolumeState = useCallback((vol: number) => {
    const bounded = Math.max(0, Math.min(1, vol));
    setVolume(bounded);
  }, []);

  const clearAudioError = () => {
    setAudioError(null);
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      if (prev === "off") return "one";
      if (prev === "one") return "all";
      return "off";
    });
  };

  // Mood filter toggle
  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowRight":
          e.preventDefault();
          if (activeBeat && duration > 0) {
            const newTime = Math.min(currentTime + 5, duration);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          if (activeBeat && duration > 0) {
            const newTime = Math.max(currentTime - 5, 0);
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }
          }
          break;
        case "KeyN":
          e.preventDefault();
          skipNext();
          break;
        case "KeyP":
          e.preventDefault();
          skipPrevious();
          break;
        case "KeyM":
          e.preventDefault();
          setVolume((prev) => prev === 0 ? 0.8 : 0);
          break;
        case "BracketRight": // ]
        case "Equal": // + (Shift+= on US keyboards)
          e.preventDefault();
          setVolume((prev) => Math.min(prev + 0.1, 1));
          break;
        case "BracketLeft": // [
        case "Minus": // -
          e.preventDefault();
          setVolume((prev) => Math.max(prev - 0.1, 0));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeBeat, duration, currentTime, skipNext, skipPrevious]);

  // Clear filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedGenre("All genres");
    setSelectedBpm("Any BPM");
    setSelectedKey("Any key");
    setSelectedMoods([]);
    showToast("Filters cleared", "neutral");
  };

  // Filter count logic
  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    (selectedGenre !== "All genres" ? 1 : 0) +
    (selectedBpm !== "Any BPM" ? 1 : 0) +
    (selectedKey !== "Any key" ? 1 : 0) +
    selectedMoods.length;

  // Checkout trigger helpers
  const openCheckout = (beat: Beat, licenseType: LicenseType = "non-exclusive") => {
    setCheckout({
      isOpen: true,
      beat,
      licenseType,
      step: 1,
      discountCode: "",
      discountApplied: false,
      discountPercentage: 0,
      discountError: "",
      customerName: "",
      customerEmail: "",
      createAccount: false,
      orderRef: "",
    });
  };

  const closeCheckout = () => {
    setCheckout((prev) => ({ ...prev, isOpen: false }));
  };

  const setCheckoutStep = (step: 1 | 2 | 3 | 4) => {
    setCheckout((prev) => ({ ...prev, step }));
  };

  const updateCheckoutDetails = (fields: Partial<CheckoutState>) => {
    setCheckout((prev) => ({ ...prev, ...fields }));
  };

  const applyDiscount = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setCheckout((prev) => ({ ...prev, discountError: "" }));
      return;
    }

    if (cleanCode === "DRILL20") {
      setCheckout((prev) => ({
        ...prev,
        discountCode: cleanCode,
        discountApplied: true,
        discountPercentage: 20,
        discountError: "",
      }));
      showToast("Promo code applied: 20% OFF", "success");
    } else if (cleanCode === "FREEBEAT") {
      setCheckout((prev) => ({
        ...prev,
        discountCode: cleanCode,
        discountApplied: true,
        discountPercentage: 100,
        discountError: "",
      }));
      showToast("Promo code applied: 100% OFF!", "success");
    } else {
      setCheckout((prev) => ({
        ...prev,
        discountApplied: false,
        discountPercentage: 0,
        discountError: "Invalid discount code",
      }));
      showToast("Invalid discount code", "error");
    }
  };

  const resetCheckout = () => {
    setCheckout({
      isOpen: false,
      beat: null,
      licenseType: "non-exclusive",
      step: 1,
      discountCode: "",
      discountApplied: false,
      discountPercentage: 0,
      discountError: "",
      customerName: "",
      customerEmail: "",
      createAccount: false,
      orderRef: "",
    });
  };

  const completeCheckout = () => {
    // Generate a beautiful mock order reference using DM Mono
    const randomRef = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    setCheckout((prev) => ({
      ...prev,
      step: 4,
      orderRef: randomRef,
    }));
    showToast("Purchase complete! Email sent.", "success");
  };



  // Phase 3: Media Session API - Update metadata when beat changes
  useEffect(() => {
    if (!activeBeat || typeof navigator === "undefined") return;

    if ("mediaSession" in navigator && "MediaMetadata" in window) {
      const mediaSession = navigator.mediaSession;
      
      // Set metadata
      mediaSession.metadata = new MediaMetadata({
        title: activeBeat.title,
        artist: "Beat Store",
        album: activeBeat.genre,
        artwork: [
          {
            src: activeBeat.coverUrl,
            sizes: "256x256",
            type: "image/jpeg",
          },
        ],
      });

      // Set playback state
      mediaSession.playbackState = isPlaying ? "playing" : "paused";

      // Handle media session action handlers
      mediaSession.setActionHandler("play", () => {
        setIsPlaying(true);
      });
      mediaSession.setActionHandler("pause", () => {
        setIsPlaying(false);
      });
      mediaSession.setActionHandler("previoustrack", () => {
        skipPrevious();
      });
      mediaSession.setActionHandler("nexttrack", () => {
        skipNext();
      });

      // Optional: Handle seek to
      mediaSession.setActionHandler("seekto", (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });
    }
  }, [activeBeat, isPlaying, skipNext, skipPrevious, seek]);



  return (
    <StoreContext.Provider
      value={{
        // Beats data
        allBeats,
        setAllBeats,

        theme,
        toggleTheme,
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
        currentTime,
        duration,
        volume,
        isAudioLoading,
        audioError,
        repeatMode,
        playBeat,
        pauseBeat,
        togglePlayPause,
        seek,
        setVolumeState,
        skipNext,
        skipPrevious,
        toggleRepeatMode,
        clearAudioError,

        audioAnalyzer,

        detailModalBeat,
        setDetailModalBeat,

        checkout,
        openCheckout,
        closeCheckout,
        setCheckoutStep,
        applyDiscount,
        updateCheckoutDetails,
        resetCheckout,
        completeCheckout,

        toasts,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
