"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useSong } from "@/lib/useSongs";
import { useAuthUser } from "@/lib/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import ChordLine from "@/components/ChordLine";
import YouTubeMiniPlayer from "@/components/YouTubeMiniPlayer";
import HeartButton from "@/components/HeartButton";
import {
  extractChordsFromChart,
  findPlayableTranspositions,
  transposeLine,
} from "@/lib/chords";

export default function SongPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { song } = useSong(params.id);
  const { user } = useAuthUser();
  const [shift, setShift] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const viableShifts = useMemo(() => {
    if (!song) return [];
    return findPlayableTranspositions(extractChordsFromChart(song.chart));
  }, [song]);

  if (song === undefined) return null;
  if (song === null) return notFound();

  const transposedChart = song.chart.map((line) => transposeLine(line, shift));

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("songs").delete().eq("id", song.id);
    setDeleting(false);
    if (!error) router.push("/");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            {song.title}
            <HeartButton songId={song.id} size={19} />
          </h1>
          <p className="text-ink/60 dark:text-cream/60">
            {song.singers.join(", ")} {song.movie && `· ${song.movie}`} · {song.year}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-1">
          {song.youtubeId && <YouTubeMiniPlayer videoId={song.youtubeId} title={song.title} />}
          {user && (
            <>
              <Link
                href={`/songs/${song.id}/edit`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/20"
              >
                Edit
              </Link>
              {confirmDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-red-500 text-white disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm delete"}
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-red-500/30 text-red-500"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Transpose within your chords</h2>
        {viableShifts.length === 0 ? (
          <p className="text-sm text-ink/60 dark:text-cream/60">
            No shift makes this song fit entirely inside A, E, Em, G, C, D — it needs at least one chord outside your set.
          </p>
        ) : (
          <>
            <p className="text-sm text-ink/60 dark:text-cream/60 mb-3">
              These shifts keep every chord within A, E, Em, G, C, D. Pick whichever sits best in your vocal range.
            </p>
            <div className="flex flex-wrap gap-2">
              {viableShifts.map((s) => (
                <button
                  key={s}
                  onClick={() => setShift(s)}
                  className={`px-3 py-1.5 rounded-full text-sm border ${
                    shift === s
                      ? "bg-teal text-white border-teal"
                      : "border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10"
                  }`}
                >
                  {s === 0 ? "Original" : `Shift +${s}`}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card p-6 font-mono text-sm sm:text-base">
        {transposedChart.map((line, i) => (
          <ChordLine key={i} line={line} />
        ))}
      </div>
    </div>
  );
}
