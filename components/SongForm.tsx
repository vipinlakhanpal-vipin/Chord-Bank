"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Genre, GENRES, Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";

// Shared by /songs/new (create) and /songs/[id]/edit (update). This form never
// writes lyrics on its own — it just takes whatever chart text you paste in
// (from wherever you sourced it) and saves it to your Supabase songs table.

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function extractYoutubeId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  const watchMatch = trimmed.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = trimmed.match(/embed\/([A-Za-z0-9_-]{6,})/);
  if (embedMatch) return embedMatch[1];
  // Otherwise assume they pasted the raw video id already.
  return trimmed;
}

const INPUT_CLASS = "w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5";

export default function SongForm({ existing }: { existing?: Song }) {
  const router = useRouter();
  const isEdit = !!existing;

  const [title, setTitle] = useState(existing?.title ?? "");
  const [singers, setSingers] = useState(existing?.singers.join(", ") ?? "");
  const [movie, setMovie] = useState(existing?.movie ?? "");
  const [year, setYear] = useState(existing ? String(existing.year) : "");
  const [genres, setGenres] = useState<Genre[]>(existing?.genres ?? []);
  const [youtubeInput, setYoutubeInput] = useState(existing?.youtubeId ?? "");
  const [chartText, setChartText] = useState(existing?.chart.join("\n") ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chartLines = useMemo(
    () => chartText.split("\n").map((l) => l.replace(/\r$/, "")),
    [chartText]
  );

  const preview = useMemo(() => {
    const chords = extractChordsFromChart(chartLines);
    if (chords.length === 0) return null;
    return matchScore(chords);
  }, [chartLines]);

  const toggleGenre = (g: Genre) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const singerList = singers
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const yearNum = Number(year);

    if (!trimmedTitle) return setError("Title is required.");
    if (singerList.length === 0) return setError("Add at least one singer.");
    if (!yearNum || yearNum < 1950) return setError("Enter a valid year (1950 or later).");
    if (chartLines.filter((l) => l.trim()).length === 0) return setError("Paste in the chord chart text.");

    setSaving(true);

    const payload = {
      title: trimmedTitle,
      singers: singerList,
      movie: movie.trim() || null,
      year: yearNum,
      language: "Hindi",
      youtube_id: extractYoutubeId(youtubeInput) || null,
      chart: chartLines,
      genres,
      added_via: "manual" as const,
    };

    if (isEdit && existing) {
      const { error } = await supabase.from("songs").update(payload).eq("id", existing.id);
      setSaving(false);
      if (error) return setError(error.message);
      router.push(`/songs/${existing.id}`);
    } else {
      let id = slugify(trimmedTitle);
      if (!id) id = `song-${Date.now()}`;
      // If that id's taken, fall back to a suffixed one rather than failing.
      const { data: clash } = await supabase.from("songs").select("id").eq("id", id).maybeSingle();
      if (clash) id = `${id}-${Date.now().toString().slice(-5)}`;

      const { error } = await supabase.from("songs").insert({ id, ...payload });
      setSaving(false);
      if (error) return setError(error.message);
      router.push(`/songs/${id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Tujhe Dekha To"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Singer(s) — comma separated">
          <input
            value={singers}
            onChange={(e) => setSingers(e.target.value)}
            placeholder="e.g. Lata Mangeshkar, Kumar Sanu"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="Movie (optional)">
          <input value={movie} onChange={(e) => setMovie(e.target.value)} className={INPUT_CLASS} />
        </Field>
        <Field label="Year">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 1995"
            className={INPUT_CLASS}
          />
        </Field>
        <Field label="YouTube link or video ID (optional)" full>
          <input
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <Field label="Genres" full>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => toggleGenre(g)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                genres.includes(g)
                  ? "bg-magenta text-white border-magenta"
                  : "bg-magenta/10 border-magenta/30 text-magenta"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Chord chart"
        full
        hint={`Paste the chart you've sourced yourself, one line per line. Wrap chords in brackets like [G]lyric text, and mark sections with "## Verse", "## Chorus", "## Bridge" etc.`}
      >
        <textarea
          value={chartText}
          onChange={(e) => setChartText(e.target.value)}
          rows={14}
          placeholder={"## Verse 1\n[G]Your [D]lyric line here\n[Em]Next line [C]here\n## Chorus\n..."}
          className={`${INPUT_CLASS} font-mono text-sm`}
        />
      </Field>

      {preview && (
        <div className="text-sm px-3 py-2 rounded-xl bg-black/5 dark:bg-white/10">
          {preview.playableAsIs ? (
            <span className="text-teal font-medium">✓ Playable as-is in your 6 chords.</span>
          ) : preview.bestShift !== null ? (
            <span className="text-saffron font-medium">
              Playable with a shift of +{preview.bestShift} semitones.
            </span>
          ) : (
            <span className="text-ink/60 dark:text-cream/60">
              No shift lands every chord inside A, E, Em, G, C, D — it needs at least one chord outside your set.
              You can still save it; it just won&apos;t show as playable.
            </span>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-teal text-white font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add song"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl border border-black/10 dark:border-white/15"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="text-sm font-medium block mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-ink/50 dark:text-cream/50 mt-1">{hint}</p>}
    </div>
  );
}
