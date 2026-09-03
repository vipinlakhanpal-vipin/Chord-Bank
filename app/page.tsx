"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SongCard from "@/components/SongCard";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import { GENRES, Genre } from "@/lib/types";
import { useSongs } from "@/lib/useSongs";
import { useAuthUser } from "@/lib/useAuthUser";

const GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1.5 sm:gap-2";
// Sized to comfortably fill a wide desktop screen (up to 10 columns) before
// paginating at all — with the old value of 24, a 10-column screen only filled
// ~2.5 rows and then cut to "Page 1 of 2" with a lot of empty space still
// visible below the tiles. 60 keeps everything on one page well past the
// current library size and still reads as a reasonable "page" on narrow
// (3-column) screens; revisit again once the library is a few hundred songs.
const PAGE_SIZE = 60;

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageInner />
    </Suspense>
  );
}

function HomePageInner() {
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { songs: SONGS, loading, error: songsError } = useSongs();
  const { user } = useAuthUser();
  const [query, setQuery] = useState("");
  const [onlyPlayable, setOnlyPlayable] = useState(false);
  const [viewMode, setViewMode] = useState<"bySinger" | "all">("bySinger");
  const [year, setYear] = useState<string>("all");
  const [singer, setSinger] = useState<string>("all");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [repository, setRepository] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      searchInputRef.current?.focus();
    }
    // Coming from the Repositories page ("View songs" on a repo chip) —
    // land here with that repository already selected as a filter.
    const repoParam = searchParams.get("repo");
    if (repoParam) setRepository(repoParam);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, onlyPlayable, year, singer, genre, repository, viewMode]);

  const years = useMemo(() => Array.from(new Set(SONGS.map((s) => s.year))).sort((a, b) => b - a), [SONGS]);
  const singers = useMemo(
    () => Array.from(new Set(SONGS.flatMap((s) => s.singers))).sort((a, b) => a.localeCompare(b)),
    [SONGS]
  );
  const repositories = useMemo(
    () =>
      Array.from(new Set(SONGS.map((s) => s.repository).filter((r): r is string => !!r))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [SONGS]
  );

  const filtered = useMemo(() => {
    return SONGS.filter((s) => {
      const matchesQuery =
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.singers.some((si) => si.toLowerCase().includes(query.toLowerCase())) ||
        (s.movie ?? "").toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (year !== "all" && s.year !== Number(year)) return false;
      if (singer !== "all" && !s.singers.includes(singer)) return false;
      if (genre !== "all" && !s.genres.includes(genre)) return false;
      if (repository !== "all" && s.repository !== repository) return false;
      if (onlyPlayable) {
        const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(s.chart));
        return playableAsIs || bestShift !== null;
      }
      return true;
    });
  }, [SONGS, query, onlyPlayable, year, singer, genre, repository]);

  const bySinger = useMemo(() => {
    const map = new Map<string, typeof SONGS>();
    for (const song of filtered) {
      const primary = song.singers[0];
      if (!map.has(primary)) map.set(primary, []);
      map.get(primary)!.push(song);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pagedFlat = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const activeFilterCount = [year !== "all", singer !== "all", genre !== "all", repository !== "all", onlyPlayable].filter(
    Boolean
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-display font-bold mb-1">
            <span className="text-turquoise">Vipin Chord Bank</span>
          </h1>
          <p className="text-sm text-ink/60 dark:text-cream/60">
            Your chord library — every song filtered and transposed to fit the chords you play.
          </p>
        </div>
        <Link
          href={user ? "/songs/new" : "/login"}
          className="shrink-0 text-xs font-semibold px-3 py-2 rounded-full text-white bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md whitespace-nowrap"
        >
          + Add Song
        </Link>
      </div>

      {/* Search + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by song, singer, or movie..."
          className="flex-1 rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
        />
        <div className="inline-flex gap-1.5 self-start">
          <button
            onClick={() => setViewMode("bySinger")}
            className={pillClass(FILTER_TINTS.indigo, viewMode === "bySinger")}
          >
            By Singer
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={pillClass(FILTER_TINTS.teal, viewMode === "all")}
          >
            All Songs
          </button>
        </div>
      </div>

      {/* Filters — each gets its own tint so the row reads at a glance, matching
          the colored badges already used on song tiles (bg-<color>/10, solid
          <color> once a value is actually picked). */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Year"
          color="saffron"
          value={year}
          onChange={setYear}
          options={years.map((y) => [String(y), String(y)])}
        />
        <FilterSelect
          label="Singer"
          color="indigo"
          value={singer}
          onChange={setSinger}
          options={singers.map((s) => [s, s])}
        />
        <FilterSelect
          label="Genre"
          color="magenta"
          value={genre}
          onChange={(v) => setGenre(v as Genre | "all")}
          options={GENRES.map((g) => [g, g])}
        />
        <FilterSelect
          label="Repository"
          color="rose"
          value={repository}
          onChange={setRepository}
          options={repositories.map((r) => [r, r])}
        />
        <button onClick={() => setOnlyPlayable((v) => !v)} className={pillClass(FILTER_TINTS.teal, onlyPlayable)}>
          Only playable
        </button>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/10 dark:bg-white/15 text-ink/70 dark:text-cream/80">
          <span className="text-teal dark:text-saffron font-bold">{SONGS.length}</span> song
          {SONGS.length === 1 ? "" : "s"} in the library
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setYear("all");
              setSinger("all");
              setGenre("all");
              setRepository("all");
              setOnlyPlayable(false);
            }}
            className="text-xs text-ink/40 dark:text-cream/40 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {viewMode === "bySinger" ? (
        <div className="flex flex-col gap-7">
          {bySinger.map(([singerName, songs]) => (
            <div key={singerName}>
              <h2 className="font-semibold text-base mb-2.5 text-teal">{singerName}</h2>
              <div className={GRID}>
                {songs.map((s) => (
                  <SongCard key={s.id} song={s} />
                ))}
              </div>
            </div>
          ))}
          {bySinger.length === 0 && (
            <EmptyState loading={loading} hasAny={SONGS.length > 0} user={user} error={songsError} />
          )}
        </div>
      ) : (
        <>
          <div className={GRID}>
            {pagedFlat.map((s) => (
              <SongCard key={s.id} song={s} />
            ))}
          </div>
          {filtered.length === 0 && (
            <EmptyState loading={loading} hasAny={SONGS.length > 0} user={user} error={songsError} />
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 disabled:opacity-30"
              >
                Prev
              </button>
              <span className="text-xs text-ink/50 dark:text-cream/50">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs font-semibold px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({
  loading,
  hasAny,
  user,
  error,
}: {
  loading: boolean;
  hasAny: boolean;
  user: unknown;
  error: string | null;
}) {
  if (loading) {
    return <p className="text-sm text-ink/50 dark:text-cream/50">Loading your library...</p>;
  }
  if (error) {
    return (
      <p className="text-sm text-red-500">
        Couldn&apos;t load your library ({error}). Check your connection and try refreshing.
      </p>
    );
  }
  if (hasAny) {
    // Songs exist, just none match the current search/filters.
    return <p className="text-sm text-ink/50 dark:text-cream/50">No songs match those filters.</p>;
  }
  return (
    <p className="text-sm text-ink/50 dark:text-cream/50">
      Your library is empty —{" "}
      <Link href={user ? "/songs/new" : "/login"} className="text-teal underline">
        {user ? "add your first song" : "log in to add a song"}
      </Link>
      .
    </p>
  );
}

// Solid gradient fill + white text, same recipe as the Genre pills on Add Song
// — like a contacts app's category chips, not a tinted outline. Every pill
// is at FULL brightness ALL the time, selected or not — no opacity dimming —
// and the currently-selected one just gets an extra white ring/shadow on top
// of that same full color, so the row never looks washed out. Full literal
// class strings — Tailwind's build-time scanner needs the exact
// "from-amber-500 to-orange-600" token to appear in source, so no string
// interpolation here.
// IMPORTANT: never use "teal-NNN", "indigo-NNN", "saffron-NNN", "magenta-NNN"
// or "turquoise-NNN" — tailwind.config.ts overrides those color *names* with
// flat brand hexes, which wipes out Tailwind's own shade scale for them, so
// e.g. "from-teal-500" silently generates no CSS at all. Use a real
// full-shade-scale color (cyan, blue, violet, rose, amber, fuchsia, etc.)
// wherever a gradient needs numbered shades.
const FILTER_TINTS = {
  saffron: "from-amber-500 to-orange-600",
  indigo: "from-blue-500 to-violet-700",
  magenta: "from-fuchsia-500 to-pink-600",
  teal: "from-cyan-500 to-sky-700",
  rose: "from-rose-500 to-red-600",
} as const;

function pillClass(gradient: string, active: boolean) {
  return `text-xs font-semibold px-3 py-1.5 rounded-full text-white bg-gradient-to-br ${gradient} shadow-sm transition-all ${
    active ? "ring-2 ring-white/80 shadow-md" : ""
  }`;
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  color,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
  color: keyof typeof FILTER_TINTS;
}) {
  const gradient = FILTER_TINTS[color];
  const active = value !== "all";
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full cursor-pointer outline-none text-white bg-gradient-to-br ${gradient} shadow-sm transition-all ${
          active ? "ring-2 ring-white/80 shadow-md" : ""
        }`}
      >
        <option value="all">{label}: All</option>
        {options.map(([val, lbl]) => (
          <option key={val} value={val} className="text-ink dark:text-ink">
            {lbl}
          </option>
        ))}
      </select>
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white"
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
