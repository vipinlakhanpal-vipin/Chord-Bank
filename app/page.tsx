"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SONGS } from "@/data/songs";
import SongCard from "@/components/SongCard";
import { extractChordsFromChart, matchScore } from "@/lib/chords";

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
  const [groupBySinger, setGroupBySinger] = useState(true);

  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      searchInputRef.current?.focus();
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    return SONGS.filter((s) => {
      const matchesQuery =
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.singers.some((si) => si.toLowerCase().includes(query.toLowerCase())) ||
        (s.movie ?? "").toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (onlyPlayable) {
        const { playableAsIs, bestShift } = matchScore(extractChordsFromChart(s.chart));
        return playableAsIs || bestShift !== null;
      }
      return true;
    });
  }, [query, onlyPlayable]);

  const bySinger = useMemo(() => {
    const map = new Map<string, typeof SONGS>();
    for (const song of filtered) {
      const primary = song.singers[0];
      if (!map.has(primary)) map.set(primary, []);
      map.get(primary)!.push(song);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">
          Welcome to <span className="text-magenta dark:text-saffron">Chord Bank</span>
        </h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          Your Bollywood chord library — every song filtered and transposed to fit the chords you play.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <input
          ref={searchInputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by song, singer, or movie..."
          className="flex-1 rounded-xl px-4 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={onlyPlayable} onChange={(e) => setOnlyPlayable(e.target.checked)} />
          Only show songs I can play
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={groupBySinger} onChange={(e) => setGroupBySinger(e.target.checked)} />
          Group by singer
        </label>
      </div>

      {groupBySinger ? (
        <div className="flex flex-col gap-8">
          {bySinger.map(([singer, songs]) => (
            <div key={singer}>
              <h2 className="font-semibold text-lg mb-3 text-teal">{singer}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {filtered.map((s) => (
            <SongCard key={s.id} song={s} />
          ))}
        </div>
      )}
    </div>
  );
}
