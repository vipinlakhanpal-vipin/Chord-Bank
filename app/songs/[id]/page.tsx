"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import { useSong } from "@/lib/useSongs";
import { useAuthUser } from "@/lib/useAuthUser";
import { supabase } from "@/lib/supabaseClient";
import ChordLine from "@/components/ChordLine";
import YouTubeMiniPlayer from "@/components/YouTubeMiniPlayer";
import HeartButton from "@/components/HeartButton";
import AutoScroll from "@/components/AutoScroll";
import {
  extractChordsFromChart,
  findPlayableTranspositions,
  transposeLine,
  FULL_RANGE_SHIFTS,
} from "@/lib/chords";

export default function SongPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { song } = useSong(params.id);
  const { user } = useAuthUser();
  // "Original" always shows the song exactly as entered (shift 0), whether or
  // not it fits your 6 chords — you asked for a sure way back to it, since
  // the old design only ever showed shift buttons that were actually
  // playable, so "0" could vanish entirely and leave no way back.
  // "Transpose" is a step-through-with-+/- control instead of a flat list of
  // buttons, moving only between shifts that keep every chord inside your
  // A, E, Em, G, C, D.
  const [mode, setMode] = useState<"original" | "transpose">("original");
  const [transposeShift, setTransposeShift] = useState<number | null>(null);
  // "Playable" steps through only the shifts that keep every chord inside
  // your A, E, Em, G, C, D (the original behavior). "Full range" is the
  // ordinary +1..+11 transpose you'd get in a generic phone chord app —
  // every shift, whether or not it lands on one of your 6. You asked for
  // both, since "playable" alone could mean only +5/+7 show up for a song
  // and nothing else, with no way to just transpose normally.
  const [rangeMode, setRangeMode] = useState<"playable" | "full">("playable");
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const viableShifts = useMemo(() => {
    if (!song) return [];
    return findPlayableTranspositions(extractChordsFromChart(song.chart));
  }, [song]);

  // Ascending order for the +/- stepper (closest-first order, from the chord
  // engine, is better for "here's the best pick" but confusing to step
  // through — this makes + always go up and - always go down, predictably.
  const sortedViableShifts = useMemo(
    () => [...viableShifts].sort((a, b) => a - b),
    [viableShifts]
  );
  const bestShift = viableShifts[0] ?? null;

  // Which list the +/- stepper walks through depends on the range toggle.
  const activeShiftList = rangeMode === "playable" ? sortedViableShifts : FULL_RANGE_SHIFTS;
  const defaultShiftFor = (range: "playable" | "full") =>
    range === "playable" ? bestShift : FULL_RANGE_SHIFTS[0];

  // Reset to Original whenever you land on a (possibly different) song —
  // a transpose choice on one song should never carry over to the next.
  useEffect(() => {
    setMode("original");
    setTransposeShift(null);
    setRangeMode("playable");
  }, [song?.id]);

  if (song === undefined) return null;
  if (song === null) return notFound();

  const activeShift = mode === "original" ? 0 : transposeShift ?? defaultShiftFor(rangeMode) ?? 0;
  const transposedChart = song.chart.map((line) => transposeLine(line, activeShift));
  const originalFits = viableShifts.includes(0);

  const stepperIndex = activeShiftList.indexOf(transposeShift ?? defaultShiftFor(rangeMode) ?? -1);
  const canStepDown = stepperIndex > 0;
  const canStepUp = stepperIndex >= 0 && stepperIndex < activeShiftList.length - 1;

  const openTranspose = () => {
    setMode("transpose");
    if (transposeShift === null) setTransposeShift(defaultShiftFor(rangeMode));
  };
  const switchRange = (range: "playable" | "full") => {
    setRangeMode(range);
    setTransposeShift(defaultShiftFor(range));
  };
  const stepDown = () => {
    if (canStepDown) setTransposeShift(activeShiftList[stepperIndex - 1]);
  };
  const stepUp = () => {
    if (canStepUp) setTransposeShift(activeShiftList[stepperIndex + 1]);
  };

  // Capo math: playing an easy shape with a capo on fret N makes it SOUND N
  // semitones higher than that shape played open. So to sound like the
  // ORIGINAL chord while fretting one of your 6 easy shapes, you need a
  // shape that's (12 - N) semitones above the original — which is exactly
  // what "shift" already means here. So a given transpose shift S has a
  // matching capo fret of (12 - S) mod 12: capo there, play the "+S" shapes
  // shown, and it sounds pitched exactly like the original recording.
  const capoFretForShift = (s: number) => (12 - s) % 12;
  const currentCapoFret =
    mode === "transpose" && transposeShift ? capoFretForShift(transposeShift) : null;

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
          {user === undefined && (
            <span className="text-xs text-ink/40 dark:text-cream/40">Checking login...</span>
          )}
          {user === null && (
            <Link
              href="/login"
              className="text-xs font-semibold text-teal underline"
            >
              Log in to edit or delete
            </Link>
          )}
          {user && (
            <>
              <Link
                href={`/songs/${song.id}/edit`}
                className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md"
              >
                Edit
              </Link>
              {confirmDelete ? (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-gradient-to-br from-red-500 to-rose-700 shadow-md disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Confirm delete"}
                </button>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-gradient-to-br from-red-400 to-rose-600 shadow-sm opacity-80 hover:opacity-100"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("original")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              mode === "original"
                ? "text-white bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md"
                : "border border-black/10 dark:border-white/20 text-ink/70 dark:text-cream/70"
            }`}
          >
            Original
          </button>
          <button
            onClick={openTranspose}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              mode === "transpose"
                ? "text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-md"
                : "border border-black/10 dark:border-white/20 text-ink/70 dark:text-cream/70"
            }`}
          >
            Transpose
          </button>
        </div>

        {mode === "original" ? (
          <p className="text-sm text-ink/60 dark:text-cream/60">
            Your song exactly as entered, no shift applied.{" "}
            {originalFits ? (
              <span className="text-teal font-medium">Already fits your A, E, Em, G, C, D as-is.</span>
            ) : (
              <>
                This uses at least one chord outside A, E, Em, G, C, D — tap <strong>Transpose</strong> to shift
                it into your 6 chords.
              </>
            )}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Playable only shows shifts where every chord lands on your 6 —
                for a lot of songs that's just one or two shifts (sometimes
                none). Full range is the ordinary +1..+11 transpose, same as
                any other chord app, regardless of whether it's playable with
                your 6 chords. */}
            <div className="flex gap-2">
              <button
                onClick={() => switchRange("playable")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  rangeMode === "playable"
                    ? "text-white bg-gradient-to-br from-teal to-cyan-700 shadow-sm"
                    : "border border-black/10 dark:border-white/20 text-ink/60 dark:text-cream/60"
                }`}
              >
                Playable only
              </button>
              <button
                onClick={() => switchRange("full")}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  rangeMode === "full"
                    ? "text-white bg-gradient-to-br from-teal to-cyan-700 shadow-sm"
                    : "border border-black/10 dark:border-white/20 text-ink/60 dark:text-cream/60"
                }`}
              >
                Full range (+1 to +11)
              </button>
            </div>

            {rangeMode === "playable" && viableShifts.length === 0 ? (
              <p className="text-sm text-ink/60 dark:text-cream/60">
                No shift makes this song fit entirely inside A, E, Em, G, C, D — it needs at least one chord
                outside your set no matter how it&apos;s shifted. Tap <strong>Full range</strong> above to
                transpose it anyway.
              </p>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <button
                    onClick={stepDown}
                    disabled={!canStepDown}
                    aria-label="Shift down"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform"
                  >
                    −
                  </button>
                  <div className="text-lg font-bold w-16 text-center">
                    {transposeShift === 0 ? "0" : `+${transposeShift}`}
                  </div>
                  <button
                    onClick={stepUp}
                    disabled={!canStepUp}
                    aria-label="Shift up"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold text-white bg-gradient-to-br from-violet-500 to-purple-700 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-90 transition-transform"
                  >
                    +
                  </button>
                  <p className="text-xs text-ink/50 dark:text-cream/50">
                    {rangeMode === "playable"
                      ? "Step through every shift that keeps all chords inside your 6. Tap Original any time to get back."
                      : "Step through all 11 transpositions, whether or not they fit your 6 chords. Tap Original any time to get back."}
                  </p>
                </div>
                {transposeShift === 0 ? (
                  <p className="text-xs text-ink/50 dark:text-cream/50">
                    This is the same as Original — no capo needed, it already matches the recording's key.
                  </p>
                ) : (
                  currentCapoFret !== null && (
                    <p className="text-xs text-ink/50 dark:text-cream/50">
                      {currentCapoFret >= 1 && currentCapoFret <= 4 ? (
                        <>
                          <strong>Capo on fret {currentCapoFret}</strong> + these shapes sounds exactly like the
                          original recording's key.
                        </>
                      ) : (
                        <>
                          To match the original recording&apos;s key exactly with these shapes you&apos;d need a
                          capo on fret {currentCapoFret} — outside the usual 1–4 range, so without a capo this
                          will just sound {transposeShift} semitones higher than the recording, which is fine if
                          it suits your voice.
                        </>
                      )}
                    </p>
                  )
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="card p-6 font-mono text-sm sm:text-base">
        {transposedChart.map((line, i) => (
          <ChordLine key={i} line={line} />
        ))}
      </div>

      {/* Extra bottom padding so the floating Auto-scroll bar never sits on
          top of the last couple of chart lines. */}
      <div className="h-20" aria-hidden="true" />

      <AutoScroll />
    </div>
  );
}
