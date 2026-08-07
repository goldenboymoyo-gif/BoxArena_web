"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";

interface YTPlayerEvent {
  target: YTPlayer;
  data?: number;
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YTPlayerOptions {
  videoId: string;
  host?: string;
  playerVars?: Record<string, string | number | boolean>;
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTPlayerEvent) => void;
  };
}

interface YTNamespace {
  Player: new (element: HTMLElement, options: YTPlayerOptions) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface BoxArenaPlayerProps {
  videoId: string;
  title: string;
  autoplay?: boolean;
  live?: boolean;
  label?: string;
  poster?: string;
}

export function BoxArenaPlayer({
  videoId,
  title,
  autoplay = false,
  live = false,
  label,
  poster,
}: BoxArenaPlayerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const createdRef = useRef(false);

  const [apiReady, setApiReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.YT?.Player)
  );
  const [started, setStarted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (apiReady) return;
    window.onYouTubeIframeAPIReady = () => setApiReady(true);
    if (!document.getElementById("ba-yt-api")) {
      const script = document.createElement("script");
      script.id = "ba-yt-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
    return () => {
      window.onYouTubeIframeAPIReady = undefined;
    };
  }, [apiReady]);

  const start = useCallback(() => {
    if (createdRef.current) return;
    if (!window.YT?.Player || !mountRef.current) return;
    createdRef.current = true;
    setStarted(true);
    setBuffering(true);
    new window.YT.Player(mountRef.current, {
      videoId,
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        autoplay: 1,
        controls: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        mute: 1,
        fs: 0,
        disablekb: 1,
        iv_load_policy: 3,
      },
      events: {
        onReady: (event) => {
          playerRef.current = event.target;
          event.target.setVolume(100);
          event.target.mute();
          setMuted(true);
          setBuffering(false);
          event.target.playVideo();
        },
        onStateChange: (event) => {
          const data = event.data ?? -1;
          setPlaying(data === 1);
          setBuffering(data === 3);
        },
      },
    });
  }, [videoId]);

  useEffect(() => {
    if (autoplay && apiReady) start();
  }, [autoplay, apiReady, start]);

  useEffect(() => {
    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      createdRef.current = false;
    };
  }, []);

  useEffect(() => {
    const onFsChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  function togglePlay() {
    const player = playerRef.current;
    if (!player) return;
    if (playing) player.pauseVideo();
    else player.playVideo();
  }

  function toggleMute() {
    const player = playerRef.current;
    if (!player) return;
    if (muted) {
      player.unMute();
      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  }

  function toggleFullscreen() {
    if (!cardRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void cardRef.current.requestFullscreen();
    }
  }

  return (
    <div ref={cardRef} className="overflow-hidden rounded-3xl border border-white/10 bg-black">
      <div className="relative aspect-video [&_iframe]:absolute [&_iframe]:inset-0 [&_iframe]:h-full [&_iframe]:w-full">
        <div ref={mountRef} className="absolute inset-0 [&>div]:h-full [&>div]:w-full" />

        {!started && (
          <button
            type="button"
            onClick={start}
            aria-label={live ? `Start watching ${title}` : `Play ${title}`}
            className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#0a0a0a]"
          >
            {poster && (
              <img
                src={poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition duration-700 group-hover:scale-105 group-hover:opacity-55"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-black/30" />
            <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2">
              <span className="font-display text-sm font-bold uppercase tracking-[0.22em] text-white">
                Box<span className="text-[#e31b23]">Arena</span>
              </span>
              {live && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e31b23] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/70" />
                    <span className="live-dot relative inline-flex size-2 rounded-full bg-white" />
                  </span>
                  LIVE
                </span>
              )}
            </div>
            <span className="relative grid size-20 place-items-center rounded-full border border-white/25 bg-white/10 backdrop-blur-md transition group-hover:border-[#e31b23] group-hover:bg-[#e31b23]">
              <Play className="ml-1 size-8 fill-white text-white" />
            </span>
            <span className="relative mt-4 text-xs font-bold uppercase tracking-[0.28em] text-white/80">
              Watch on BoxArena
            </span>
            {label && (
              <span className="relative mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                {label}
              </span>
            )}
          </button>
        )}

        {started && !buffering && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="absolute inset-0 cursor-pointer"
          />
        )}

        {started && buffering && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
            <Loader2 className="size-10 animate-spin text-[#e31b23]" />
          </div>
        )}
      </div>

      {started && (
        <div className="flex items-center gap-2 border-t border-white/10 bg-[#111111] px-4 py-3">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
            className="grid size-10 cursor-pointer place-items-center rounded-full bg-[#e31b23] text-white transition hover:bg-[#c3161d]"
          >
            {playing ? <Pause className="size-4" /> : <Play className="ml-0.5 size-4" />}
          </button>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
          >
            {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
          </button>

          <div className="ml-2 min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">
              Now {live ? "streaming" : "playing"} on{" "}
              <span className="font-display text-white">
                Box<span className="text-[#e31b23]">Arena</span>
              </span>
            </p>
            {live && (
              <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff6b6b]">
                <span className="live-dot size-1.5 rounded-full bg-[#e31b23]" /> Live
                stream
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-[#e31b23]/50 hover:text-white"
          >
            {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          </button>
        </div>
      )}
    </div>
  );
}
