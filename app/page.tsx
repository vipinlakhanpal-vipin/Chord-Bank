"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SONGS } from "@/data/songs";
import SongCard from "@/components/SongCard";
import { extractChordsFromChart, matchScore } from "@/lib/chords";
import { GENRES, Genre } from "@/lib/types";

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
  const [query, setQuery] = useState("");
  const [onlyPlayable, setOnlyPlayable] = useState(false);
  const [viewMode, setViewMode] = useState<"bySinger" | "all">("bySinger");
  const [year, setYear] = useState<string>("all");
  const [singer, setSinger] = useState<string>("all");
  const [genre, setGenre] = useState<Genre | "all">("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [query, onlyPlayable, year, singer, genre, viewMode]);

  const years = useMemo(() => Array.from(new Set(SONGS.map((s) => s.year))).sort((a, b) => b - a), []);
  const singers = useMemo(
    () => Array.from(new Set(SONGS.flatMap((s) => s.singers))).sort((a, b) => a.localeCompare(b)),
    []
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
      if (onlyPlayable) {
        const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(s.chart));
        return playableAsIs || bestShift !== null;
      }
      return true;
    });
  }, [query, onlyPlayable, year, singer, genre]);

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

  const activeFilterCount = [year !== "all", singer !== "all", genre !== "all", onlyPlayable].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">
          Welcome to <span className="text-magenta dark:text-saffron">Chord Bank</span>
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Your Bollywood chord library — every song filtered and transposed to fit the chords you play.
        </p>
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
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              viewMode === "bySinger" ? FILTER_TINTS.indigo.active : FILTER_TINTS.indigo.inactive
            }`}
          >
            By Singer
          </button>
          <button
            onClick={() => setViewMode("all")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
              viewMode === "all" ? FILTER_TINTS.teal.active : FILTER_TINTS.teal.inactive
            }`}
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
        <button
          onClick={() => setOnlyPlayable((v) => !v)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
            onlyPlayable ? "bg-teal text-white border-teal" : "bg-teal/10 border-teal/30 text-teal"
          }`}
        >
          Only playable
        </button>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-ink/5 dark:bg-white/10 text-ink/60 dark:text-cream/60">
          <span className="text-teal dark:text-saffron font-bold">{SONGS.length}</span> songs in the library
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setYear("all");
              setSinger("all");
              setGenre("all");
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
            <p className="text-sm text-ink/50 dark:text-cream/50">No songs match yet — add more via Repositories.</p>
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
            <p className="text-sm text-ink/50 dark:text-cream/50">No songs match yet — add more via Repositories.</p>
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

// Full literal class strings per color (Tailwind's build-time scanner needs the
// exact "bg-saffron/10" etc. token to appear somewhere in the source — building
// these with string interpolation like `bg-${color}/10` would silently produce
// no styles at all).
const FILTER_TINTS = {
  saffron: {
    inactive: "border-saffron/30 bg-saffron/10 text-saffron",
    active: "border-saffron bg-saffron text-white",
    chevronInactive: "text-saffron/70",
  },
  indigo: {
    inactive: "border-indigo/30 bg-indigo/10 text-indigo",
    active: "border-indigo bg-indigo text-white",
    chevronInactive: "text-indigo/70",
  },
  magenta: {
    inactive: "border-magenta/30 bg-magenta/10 text-magenta",
    active: "border-magenta bg-magenta text-white",
    chevronInactive: "text-magenta/70",
  },
  teal: {
    inactive: "border-teal/30 bg-teal/10 text-teal",
    active: "border-teal bg-teal text-white",
    chevronInactive: "text-teal/70",
  },
} as const;

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
  const tint = FILTER_TINTS[color];
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-full border cursor-pointer outline-none transition-colors ${
          value === "all" ? tint.inactive : tint.active
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
        className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${
          value === "all" ? tint.chevronInactive : "text-white"
        }`}
      >
        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
