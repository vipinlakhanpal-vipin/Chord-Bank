"use client";

import { useState } from "react";

// A small YouTube icon/link. Clicking it opens a compact popup with the
// official embedded player — just enough to listen along while you practice,
// not a big thumbnail taking over the page.
export default function YouTubeMiniPlayer({ videoId, title }: { videoId: string; title: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title={`Play "${title}" on YouTube`}
        className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500/80 hover:text-red-500"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z" />
        </svg>
        Listen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white dark:bg-ink rounded-2xl shadow-xl overflow-hidden w-full max-w-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-black/5 dark:border-white/10">
              <p className="text-xs font-medium truncate pr-2">{title}</p>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-6 h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-xs shrink-0"
              >
                ✕
              </button>
            </div>
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title={`${title} — YouTube`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
