import Link from "next/link";
import { Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import YouTubeMiniPlayer from "./YouTubeMiniPlayer";

// Rotating accent palette so tiles read as colorful without any per-song config.
const ACCENTS = [
  "border-l-saffron",
  "border-l-teal",
  "border-l-magenta",
  "border-l-indigo",
];

function accentFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[hash % ACCENTS.length];
}

export default function SongCard({ song }: { song: Song }) {
  const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(song.chart));
  return (
    <Link
      href={`/songs/${song.id}`}
      className={`card border-l-4 ${accentFor(song.id)} p-2.5 flex flex-col gap-0.5 hover:shadow-md transition-shadow text-sm`}
    >
      <div className="flex items-start justify-between gap-1">
        <h3 className="font-semibold leading-snug line-clamp-2">{song.title}</h3>
        <span className="text-[10px] text-ink/40 dark:text-cream/40 shrink-0">{song.year}</span>
      </div>
      <p className="text-[11px] text-ink/60 dark:text-cream/60 truncate">{song.singers.join(", ")}</p>

      <div className="flex items-center justify-between mt-1">
        {playableAsIs ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-teal/10 text-teal font-medium">
            Playable
          </span>
        ) : bestShift !== null ? (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-saffron/10 text-saffron font-medium">
            Shift {bestShift}
          </span>
        ) : (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink/40 dark:text-cream/40">
            Other chords
          </span>
        )}
        {song.youtubeId && <YouTubeMiniPlayer videoId={song.youtubeId} title={song.title} />}
      </div>
    </Link>
  );
}
