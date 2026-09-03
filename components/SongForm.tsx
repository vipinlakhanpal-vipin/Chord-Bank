"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Genre, GENRES, Song } from "@/lib/types";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import { convertUgChartToInline } from "@/lib/chartImport";
import { useRepositories } from "@/lib/useRepositories";

// Solid gradient fill + white text per genre — like a contacts app's category
// chips, not a tinted outline. Selection is shown by dimming the unselected
// ones (ring + full brightness when picked) rather than switching color
// families, so every chip stays a real, filled color at all times. Full
// literal class strings — Tailwind's build-time scanner needs the exact
// "from-rose-500 to-pink-600" token to appear in source.
const GENRE_STYLES: Record<Genre, string> = {
  Romantic: "from-rose-500 to-pink-600",
  Classic: "from-amber-500 to-orange-600",
  Friendship: "from-emerald-500 to-green-600",
  Wedding: "from-fuchsia-500 to-purple-600",
  Party: "from-orange-500 to-red-600",
  Emotional: "from-sky-500 to-blue-600",
  Devotional: "from-violet-500 to-indigo-600",
  Patriotic: "from-lime-500 to-green-700",
};

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
  const [repository, setRepository] = useState(existing?.repository ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { names: repoNames, createRepository } = useRepositories();

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

  // Ultimate Guitar (and most tab sites) put chords on their own line, spaced
  // out above the plain lyric line below — not inline like this app needs.
  // Intercepting the paste and running it through the converter means pasting
  // straight from the source "just works": chords land inline automatically,
  // and you can still hand-edit the result afterward to move any [Chord] tag
  // to a different word if the auto-alignment isn't quite right.
  const handleChartPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text/plain");
    if (!pasted) return;
    const converted = convertUgChartToInline(pasted);
    if (converted === pasted) return; // nothing to convert — let the normal paste happen
    e.preventDefault();
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    setChartText(chartText.slice(0, start) + converted + chartText.slice(end));
  };

  // Fallback for when paste interception doesn't fire (e.g. text dropped in,
  // typed in over multiple steps, or a browser that blocks clipboard reads on
  // paste) — reformats whatever's already in the box.
  const handleReformat = () => setChartText((prev) => convertUgChartToInline(prev));

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

    const trimmedRepo = repository.trim();
    if (trimmedRepo) await createRepository(trimmedRepo); // so it shows up in Repositories even at 0-then-1 songs

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
      repository: trimmedRepo || null,
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
              className={`text-xs font-bold px-3 py-1.5 rounded-full text-white bg-gradient-to-br ${GENRE_STYLES[g]} transition-all ${
                genres.includes(g) ? "opacity-100 ring-2 ring-white/80 shadow-md" : "opacity-45 hover:opacity-70"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Repository (optional)"
        full
        hint={`Group this song under a name of your choosing — e.g. "Vipin" — so it shows up when you filter Home by that repository. Pick an existing one from the list, or type a new name to create it.`}
      >
        <input
          value={repository}
          onChange={(e) => setRepository(e.target.value)}
          list="repository-options"
          placeholder="e.g. Vipin"
          className={INPUT_CLASS}
        />
        <datalist id="repository-options">
          {repoNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      </Field>

      <Field
        label="Chord chart"
        full
        hint={`Paste straight from Ultimate Guitar or a similar site (chords on their own line above the lyrics) — it's auto-converted to inline [Chord]lyric format the moment you paste. Already-inline text pastes through unchanged. However it lands, you can freely retype or move any [Chord] tag to fix placement, and mark sections with "## Verse", "## Chorus", "## Bridge" etc.`}
      >
        <textarea
          value={chartText}
          onChange={(e) => setChartText(e.target.value)}
          onPaste={handleChartPaste}
          rows={14}
          placeholder={"## Verse 1\n[G]Your [D]lyric line here\n[Em]Next line [C]here\n## Chorus\n..."}
          className={`${INPUT_CLASS} font-mono text-sm`}
        />
        <button
          type="button"
          onClick={handleReformat}
          className="mt-1.5 text-xs font-semibold text-teal underline"
        >
          Re-run auto-format on this text
        </button>
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
