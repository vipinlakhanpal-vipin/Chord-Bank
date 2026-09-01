"use client";

import { useEffect, useRef, useState } from "react";

// A small YouTube icon/link. Clicking it opens a compact popup with the
// official embedded player — just enough to listen along while you practice.
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
  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPos(null);
          setOpen(true);
        }}
        title={`Play "${title}" on YouTube`}
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
            className="absolute bg-white dark:bg-ink rounded-2xl shadow-xl overflow-hidden w-72"
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
            <div className="aspect-video w-full relative">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={`${title} — YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {/* Swallows pointer events while dragging so the iframe never steals them */}
              {dragging && <div className="absolute inset-0" />}
            </div>
            {/* Some labels disable embedding for their official videos — the iframe
                above shows "Video unavailable" for those. This link always works
                as a fallback, opening the same video on youtube.com in a new tab. */}
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-[11px] text-teal py-1.5 border-t border-black/5 dark:border-white/10"
            >
              Video not playing? Open on YouTube ↗
            </a>
          </div>
        </div>
      )}
    </>
  );
}
