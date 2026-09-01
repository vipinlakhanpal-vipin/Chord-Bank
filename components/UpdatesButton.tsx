"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SONGS } from "@/data/songs";
import { hasNewSongs, markSongsSeen } from "@/lib/updates";

// One button, used on both desktop (navbar) and mobile (bottom nav): shows a
// red dot when songs have been added to the library since you last checked.
export default function UpdatesButton({ size = 20, showLabel = false }: { size?: number; showLabel?: boolean }) {
  const [badge, setBadge] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setBadge(hasNewSongs(SONGS.length));
  }, []);

  const handleClick = () => {
    markSongsSeen(SONGS.length);
    setBadge(false);
    router.push("/");
  };

  return (
    <button
      onClick={handleClick}
      aria-label="New songs"
      title="New songs added"
      className={
        showLabel
          ? "flex flex-col items-center gap-1 py-1 text-ink/50 dark:text-cream/50 relative"
          : "relative w-8 h-8 rounded-full flex items-center justify-center text-ink/60 dark:text-cream/60 hover:bg-black/5 dark:hover:bg-white/10"
      }
    >
      <span className="relative inline-flex">
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {badge && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-cream dark:border-ink" />}
      </span>
      {showLabel && <span className="text-[10px]">Updates</span>}
    </button>
  );
}
