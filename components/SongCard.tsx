import Link from "next/link";
import { Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import YouTubeMiniPlayer from "./YouTubeMiniPlayer";

// Rotating accent palette so tiles read as colorful without any per-song config.
const ACCENTS = ["border-t-saffron", "border-t-teal", "border-t-magenta", "border-t-indigo"];

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
      className={`card border-t-[3px] ${accentFor(song.id)} p-1.5 flex flex-col gap-0.5 hover:shadow-md hover:-translate-y-0.5 transition-all text-sm min-w-0`}
    >
      <h3 className="font-semibold leading-tight text-[11.5px] line-clamp-2">{song.title}</h3>
      <p className="text-[9.5px] text-ink/55 dark:text-cream/55 truncate">{song.singers[0]}</p>
      <div className="flex items-center justify-between mt-0.5 gap-1">
        {playableAsIs ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal/10 text-teal font-medium">✓</span>
        ) : bestShift !== null ? (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-saffron/10 text-saffron font-medium">
            +{bestShift}
          </span>
        ) : (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink/40 dark:text-cream/40">
            —
          </span>
        )}
        <span className="text-[9px] text-ink/35 dark:text-cream/35">{song.year}</span>
        {song.youtubeId && (
          <span className="ml-auto">
            <YouTubeMiniPlayer videoId={song.youtubeId} title={song.title} compact />
          </span>
        )}
      </div>
    </Link>
  );
}
