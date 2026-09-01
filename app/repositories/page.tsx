"use client";

import { useState } from "react";
import { Repository } from "@/lib/types";

const LANGUAGES = ["Hindi", "Punjabi", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati"];

const SEED_REPOS: Repository[] = [
  {
    id: "hindi-1970-2026",
    language: "Hindi",
    yearFrom: 1970,
    yearTo: 2026,
    status: "in-progress",
    songCount: 5,
    createdAt: "2026-08-01",
  },
];

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>(SEED_REPOS);
  const [language, setLanguage] = useState("Hindi");
  const [yearFrom, setYearFrom] = useState(1970);
  const [yearTo, setYearTo] = useState(new Date().getFullYear());

  const createRepo = () => {
    const repo: Repository = {
      id: `${language.toLowerCase()}-${yearFrom}-${yearTo}-${Date.now()}`,
      language,
      yearFrom,
      yearTo,
      status: "pending",
      songCount: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setRepos((prev) => [repo, ...prev]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Song Repositories</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          A repository is a chord-and-lyrics collection for one language over a year range, built up the same
          way as the Hindi/Bollywood one. It stores chord charts and lyric text only — never song audio — so it
          stays on the right side of copyright while still being genuinely useful to practice from.
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Create a new repository</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-sm block mb-1">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
            >
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm block mb-1">Year from</label>
            <input
              type="number"
              value={yearFrom}
              onChange={(e) => setYearFrom(Number(e.target.value))}
              className="w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
            />
          </div>
          <div>
            <label className="text-sm block mb-1">Year to</label>
            <input
              type="number"
              value={yearTo}
              onChange={(e) => setYearTo(Number(e.target.value))}
              className="w-full rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
            />
          </div>
        </div>
        <button onClick={createRepo} className="self-start px-4 py-2 rounded-xl bg-indigo text-white text-sm font-medium">
          Queue repository
        </button>
        <p className="text-xs text-ink/50 dark:text-cream/50">
          Queuing here creates the job. In production this triggers the AI ingestion workflow described in the
          README — it finds candidate songs and titles for the language/year range, writes out chord-over-lyrics
          charts in your A/E/Em/G/C/D combo (or flags the transposition needed), and a human review step before
          anything is published, since chord accuracy matters when you&apos;re relying on it to play live.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {repos.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {r.language} · {r.yearFrom}–{r.yearTo}
              </p>
              <p className="text-xs text-ink/50 dark:text-cream/50">
                {r.songCount} songs · created {r.createdAt}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                r.status === "complete"
                  ? "bg-teal/10 text-teal"
                  : r.status === "in-progress"
                  ? "bg-saffron/10 text-saffron"
                  : "bg-black/5 dark:bg-white/10 text-ink/50 dark:text-cream/50"
              }`}
            >
              {r.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
