"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import { supabase } from "@/lib/supabaseClient";
import { useAuthUser } from "@/lib/useAuthUser";
import YouTubeMiniPlayer from "./YouTubeMiniPlayer";
import HeartButton from "./HeartButton";

// Rotating accent palette so tiles read as colorful without any per-song config.
const ACCENTS = ["border-t-saffron", "border-t-teal", "border-t-magenta", "border-t-indigo"];

function accentFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export default function SongCard({ song }: { song: Song }) {
  const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(song.chart));
  const { user } = useAuthUser();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  // Edit/Delete live right on the tile — not just after opening the song —
  // since "where's the edit button" was the single most common question.
  // Both stop the click from also triggering the card's own link-to-song-page.
  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/songs/${song.id}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete "${song.title}"? This can't be undone.`)) return;
    setDeleting(true);
    const { error } = await supabase.from("songs").delete().eq("id", song.id);
    if (error) {
      setDeleting(false);
      window.alert(`Couldn't delete: ${error.message}`);
      return;
    }
    window.location.reload(); // simplest way to refresh the list everywhere it's shown
  };

  return (
    <Link
      href={`/songs/${song.id}`}
      className={`relative card border-t-[3px] ${accentFor(song.id)} p-2 sm:p-1.5 flex flex-col gap-1 sm:gap-0.5 hover:shadow-md hover:-translate-y-0.5 transition-all text-sm min-w-0 ${
        deleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      <span className="absolute top-1 right-1 bg-white/80 dark:bg-ink/70 rounded-full p-0.5 leading-none">
        <HeartButton songId={song.id} size={13} />
      </span>
      <h3 className="font-semibold leading-snug text-[13px] sm:text-[11.5px] line-clamp-2 pr-4">{song.title}</h3>
      <p className="text-[11px] sm:text-[9.5px] text-ink/55 dark:text-cream/55 truncate">{song.singers[0]}</p>
      <div className="flex items-center justify-between mt-0.5 gap-1">
        <span className="text-[10px] sm:text-[9px] text-ink/35 dark:text-cream/35">{song.year}</span>
        {song.youtubeId && (
          <span className="ml-auto">
            <YouTubeMiniPlayer videoId={song.youtubeId} title={song.title} compact />
          </span>
        )}
      </div>
      {/* Bottom action row: Edit bottom-left, playable badge dead center,
          Delete bottom-right — a 3-column grid keeps the badge truly
          centered whether or not Edit/Delete are shown (logged out).
          mt-auto (on a flex-col parent, stretched to equal row height by
          the CSS grid above) eats all the leftover space above this row,
          so it always sits flush on the tile's bottom edge instead of
          trailing right under a short vs. long title/singer/genre block. */}
      <div className="grid grid-cols-3 items-center mt-auto pt-1">
        <span className="justify-self-start">
          {user && (
            <button
              onClick={handleEdit}
              aria-label="Edit song"
              title="Edit"
              className="w-5 h-5 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-cyan-500 to-sky-700 shadow-sm"
            >
              <EditIcon />
            </button>
          )}
        </span>
        <span className="justify-self-center">
          {playableAsIs ? (
            <span className="text-[10px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white font-medium shadow-sm">
              ✓
            </span>
          ) : bestShift !== null ? (
            <span className="text-[10px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-medium shadow-sm">
              +{bestShift}
            </span>
          ) : (
            <span className="text-[10px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-ink/40 dark:text-cream/40">
              —
            </span>
          )}
        </span>
        <span className="justify-self-end">
          {user && (
            <button
              onClick={handleDelete}
              aria-label="Delete song"
              title="Delete"
              className="w-5 h-5 rounded-full flex items-center justify-center text-white bg-gradient-to-br from-red-400 to-rose-600 shadow-sm"
            >
              <TrashIcon />
            </button>
          )}
        </span>
      </div>
    </Link>
  );
}

function EditIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path
        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
