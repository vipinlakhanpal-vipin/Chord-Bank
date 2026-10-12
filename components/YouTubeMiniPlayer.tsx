"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Loads the YouTube IFrame Player API script exactly once, however many
// YouTubeMiniPlayer instances exist on the page, and resolves every caller's
// promise once it's ready.
let ytApiPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.();
      resolve();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
  return ytApiPromise;
}

// A small YouTube icon/link. Clicking it opens a compact popup with the
// official embedded player — just enough to listen along while you practice,
// entirely in-app; it never navigates away or opens a new tab on its own.
// The popup can be dragged anywhere on screen by its title bar, so it never
// has to sit on top of the lyrics you're reading.
export default function YouTubeMiniPlayer({
  videoId,
  title,
  compact = false,
}: {
  videoId: string;
  title: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  // Only true once YouTube itself reports this specific video can't be
  // embedded (its owner disabled embedding, or it's gone) — the "Open on
  // YouTube" link below only appears then, instead of always being there
  // and getting mistaken for part of the in-app player opening a tab.
  const [embedBlocked, setEmbedBlocked] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const containerId = useRef(`yt-player-${videoId}-${Math.random().toString(36).slice(2)}`).current;

  const beginDrag = (clientX: number, clientY: number) => {
    const rect = popupRef.current?.getBoundingClientRect();
    if (!rect) return;
    dragState.current = { startX: clientX, startY: clientY, originX: rect.left, originY: rect.top };
    setPos({ x: rect.left, y: rect.top });
    setDragging(true);
  };

  // Track drag on the window, not just the popup — the pointer inevitably
  // passes over the YouTube iframe while dragging, and an iframe swallows
  // mouse events meant for its parent, so a window-level listener (plus a
  // transparent overlay over the iframe while dragging, below) is what
  // keeps the drag from "sticking" the moment the cursor crosses the video.
  useEffect(() => {
    if (!dragging) return;

    const move = (clientX: number, clientY: number) => {
      if (!dragState.current) return;
      const { startX, startY, originX, originY } = dragState.current;
      const w = popupRef.current?.offsetWidth ?? 300;
      const h = popupRef.current?.offsetHeight ?? 200;
      const maxX = Math.max(0, window.innerWidth - w);
      const maxY = Math.max(0, window.innerHeight - h);
      setPos({
        x: Math.min(Math.max(0, originX + (clientX - startX)), maxX),
        y: Math.min(Math.max(0, originY + (clientY - startY)), maxY),
      });
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => move(e.touches[0].clientX, e.touches[0].clientY);
    const endDrag = () => {
      dragState.current = null;
      setDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("mouseup", endDrag);
    window.addEventListener("touchend", endDrag);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseup", endDrag);
      window.removeEventListener("touchend", endDrag);
    };
  }, [dragging]);

  // Builds the real YouTube player via the IFrame API (instead of a bare
  // <iframe src="...">) specifically so onError can tell us WHY playback
  // failed — error 101/150 means the video's owner disabled embedding
  // entirely, which is the one case where this app genuinely can't play it
  // in-app and the "Open on YouTube" fallback link is the only option.
  useEffect(() => {
    if (!open) {
      playerRef.current?.destroy?.();
      playerRef.current = null;
      return;
    }
    setEmbedBlocked(false);
    let cancelled = false;
    loadYouTubeApi().then(() => {
      if (cancelled || !playerContainerRef.current || !window.YT) return;
      playerRef.current = new window.YT.Player(containerId, {
        videoId,
        playerVars: { rel: 0 },
        events: {
          onError: (e: { data: number }) => {
            if ([100, 101, 150].includes(e.data)) setEmbedBlocked(true);
          },
        },
      });
    });
    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, videoId]);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPos(null);
          setOpen(true);
        }}
        title={`Play "${title}" right here in the app`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500/80 hover:text-red-500"
      >
        <svg width={compact ? 12 : 14} height={compact ? 12 : 14} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
        </svg>
        {!compact && "Listen"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop — click it to close; doesn't block dragging the popup anywhere on screen */}
          <div className="absolute inset-0 bg-black/40" onClick={() => !dragging && setOpen(false)} />

          <div
            ref={popupRef}
            className="absolute bg-white dark:bg-ink rounded-2xl shadow-xl overflow-hidden w-[22rem] sm:w-[30rem] max-w-[92vw]"
            style={
              pos
                ? { left: pos.x, top: pos.y }
                : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" }
            }
          >
            <div
              className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/10 cursor-move select-none"
              onMouseDown={(e) => beginDrag(e.clientX, e.clientY)}
              onTouchStart={(e) => beginDrag(e.touches[0].clientX, e.touches[0].clientY)}
            >
              <p className="text-xs font-medium truncate pr-2 pointer-events-none">{title}</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
            {/* overflow-hidden + translateZ(0) live HERE, directly around the
                iframe, instead of relying on the popup div's rounding two
                levels up. Chrome badly flickers a hardware-accelerated video
                iframe when the element that clips it (rounded + overflow-
                hidden) isn't its own compositing layer and sits inside a
                transform-positioned ancestor (this popup is drag-positioned
                via a CSS transform) — a very commonly reported Chrome bug.
                Giving the video's own wrapper both the clip and a forced
                layer fixes it without changing how anything looks. */}
            <div
              className="aspect-video w-full relative overflow-hidden"
              style={{ transform: "translateZ(0)", WebkitBackfaceVisibility: "hidden" }}
            >
              <div id={containerId} ref={playerContainerRef} className="w-full h-full" />
              {/* Swallows pointer events while dragging so the player never steals them */}
              {dragging && <div className="absolute inset-0" />}
            </div>
            {/* Only shown once YouTube itself reports this video can't be embedded
                (its owner disabled it, or it's gone) — see onError above. Opens
                the same video on youtube.com in a new tab as the one fallback for
                that specific case; the player above is otherwise fully in-app. */}
            {embedBlocked && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center text-[11px] text-teal py-1.5 border-t border-black/5 dark:border-white/10"
              >
                This video&apos;s owner disabled in-app playback — open on YouTube ↗
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
