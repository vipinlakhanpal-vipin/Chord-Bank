"use client";

import { useEffect, useRef, useState } from "react";

const PRESETS: { label: string; pxPerSec: number }[] = [
  { label: "Slow", pxPerSec: 14 },
  { label: "Med", pxPerSec: 28 },
  { label: "Fast", pxPerSec: 50 },
];

const MIN_SPEED = 6;
const MAX_SPEED = 80;
// Speed is remembered across songs and sessions (your practice pace doesn't
// really depend on which song you're playing), separately from anything
// song-specific like the transpose shift.
const STORAGE_KEY = "chordbank-autoscroll-speed";

/**
 * Hands-free scrolling for the chord chart on the song page below it, so
 * you can keep both hands on the guitar and just glance down instead of
 * reaching for the screen every few lines. Floats above the mobile bottom
 * nav (bottom-right on desktop) so Play/Pause is always reachable without
 * scrolling back up to find it mid-song.
 */
export default function AutoScroll() {
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(28);
  const [loadedSaved, setLoadedSaved] = useState(false);

  const rafRef = useRef<number>();
  const lastTsRef = useRef<number | null>(null);
  const fractionRef = useRef(0);
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    const saved = Number(localStorage.getItem(STORAGE_KEY));
    if (saved && saved >= MIN_SPEED && saved <= MAX_SPEED) setSpeed(saved);
    setLoadedSaved(true);
  }, []);

  useEffect(() => {
    // Skip the very first write so a fresh browser doesn't immediately
    // stamp the default 28 over... itself. Harmless either way, but avoids
    // a pointless write before the saved value has even been read back.
    if (loadedSaved) localStorage.setItem(STORAGE_KEY, String(speed));
  }, [speed, loadedSaved]);

  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }

    const step = (ts: number) => {
      if (lastTsRef.current === null) lastTsRef.current = ts;
      const deltaSec = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      fractionRef.current += speedRef.current * deltaSec;
      const whole = Math.floor(fractionRef.current);
      if (whole > 0) {
        window.scrollBy(0, whole);
        fractionRef.current -= whole;
      }

      // Stops on its own once you've hit the bottom of the chart, rather
      // than sitting there "running" with nowhere left to scroll.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom) {
        setPlaying(false);
        return;
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const activePreset = PRESETS.find((p) => p.pxPerSec === speed);

  return (
    <div
      className="fixed left-3 right-3 sm:left-auto sm:right-6 sm:w-80 z-30 transform-gpu rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-ink/95 backdrop-blur shadow-lg px-4 py-3 flex flex-col gap-2.5"
      style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause auto-scroll" : "Start auto-scroll"}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-emerald-500 to-green-700 shadow-md active:scale-90 transition-transform"
        >
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-ink/70 dark:text-cream/70">
            Auto-scroll{playing ? " — running" : ""}
          </p>
          <p className="text-[11px] text-ink/50 dark:text-cream/50">
            {activePreset ? activePreset.label : "Custom"} · {speed}px/s
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => setSpeed(p.pxPerSec)}
              className={`text-[10px] font-bold px-2 py-1 rounded-full text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm transition-all ${
                speed === p.pxPerSec ? "ring-2 ring-white/80 shadow-md" : ""
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <input
        type="range"
        min={MIN_SPEED}
        max={MAX_SPEED}
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full accent-emerald-600"
        aria-label="Auto-scroll speed"
      />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
    </svg>
  );
}
