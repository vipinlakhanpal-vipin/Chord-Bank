import Link from "next/link";
import { Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";

export default function SongCard({ song }: { song: Song }) {
  const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(song.chart));
  return (
    <Link
      href={`/songs/${song.id}`}
      className="card p-4 flex flex-col gap-1 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{song.title}</h3>
        <span className="text-xs text-ink/50 dark:text-cream/50">{song.year}</span>
      </div>
      <p className="text-sm text-ink/70 dark:text-cream/70">{song.singers.join(", ")}</p>
      {song.movie && <p className="text-xs text-ink/50 dark:text-cream/50">{song.movie}</p>}
      <div className="mt-2">
        {playableAsIs ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal/10 text-teal font-medium">
            Playable as-is
          </span>
        ) : bestShift !== null ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-saffron/10 text-saffron font-medium">
            Playable, capo/shift {bestShift}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-ink/50 dark:text-cream/50">
            Needs chords outside your set
          </span>
        )}
      </div>
    </Link>
  );
}
