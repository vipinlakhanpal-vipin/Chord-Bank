"use client";

import Link from "next/link";
import { useState } from "react";
import { Repository } from "@/lib/types";

const LANGUAGES = ["Hindi", "Punjabi", "Marathi", "Bengali", "Tamil", "Telugu", "Gujarati"];

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([]);
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
          A repository groups your songs by language and year range for browsing — it&apos;s organizational only.
          Songs themselves are added one at a time, with you pasting in the chart text yourself, from{" "}
          <Link href="/songs/new" className="text-teal underline">
            Add Song
          </Link>
          . There&apos;s no automated pipeline that writes chords or lyrics for you — that would mean an AI
          reproducing copyrighted song lyrics, which isn&apos;t something this app can do.
        </p>
      </div>

      <div className="card p-4 flex flex-col gap-4">
        <h2 className="font-semibold">Tag a language + year range</h2>
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
          Create repository tag
        </button>
        <p className="text-xs text-ink/50 dark:text-cream/50">
          This just creates a label to group songs under — go add the actual songs one at a time from{" "}
          <Link href="/songs/new" className="text-teal underline">
            Add Song
          </Link>
          .
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
