"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSongs } from "@/lib/useSongs";
import { useRepositories } from "@/lib/useRepositories";
import { useAuthUser } from "@/lib/useAuthUser";

// Solid gradient chips, one per repository — same recipe as every other pill
// in the app now, modeled on the "Family 7 / Friends 0 / ..." reference.
// Cycles through a fixed palette so repositories stay visually distinct
// without you having to assign colors yourself.
// NOTE: never use "teal-NNN"/"indigo-NNN" shades — tailwind.config.ts
// overrides those color names with flat brand hexes, wiping out Tailwind's
// own numbered shade scale for them, so e.g. "from-teal-500" silently
// generates no CSS. Use a real full-shade-scale color (cyan, blue, etc.).
const CHIP_GRADIENTS = [
  "from-blue-500 to-violet-700",
  "from-emerald-500 to-green-700",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-700",
  "from-slate-500 to-slate-700",
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-sky-700",
];

export default function RepositoriesPage() {
  const { songs, loading: songsLoading } = useSongs();
  const { names, loading: reposLoading, error, createRepository } = useRepositories();
  const { user } = useAuthUser();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // A repository can exist with zero songs (just created) or show up purely
  // because a song was tagged with a name nobody explicitly "created" first
  // — union both so nothing gets lost either way.
  const repos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const name of names) counts.set(name, 0);
    for (const s of songs) {
      if (!s.repository) continue;
      counts.set(s.repository, (counts.get(s.repository) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, songCount]) => ({ name, songCount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [names, songs]);

  const handleCreate = async () => {
    setCreateError(null);
    setCreating(true);
    const { error } = await createRepository(newName);
    setCreating(false);
    if (error) return setCreateError(error);
    setNewName("");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="card p-4">
        <h1 className="text-xl font-display font-bold mb-1">Repositories</h1>
        <p className="text-sm text-ink/60 dark:text-cream/60">
          A repository is just a name your songs are grouped under — e.g. your own name, or a friend&apos;s. Tap a
          repository below to see the songs in it, or add the repository name while{" "}
          <Link href="/songs/new" className="text-teal underline">
            adding a song
          </Link>
          .
        </p>
      </div>

      {user && (
        <div className="card p-4 flex flex-col gap-2">
          <h2 className="font-semibold text-sm">Create a new repository</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Vipin"
              className="flex-1 rounded-xl px-3 py-2 border border-black/10 dark:border-white/10 bg-white dark:bg-white/5"
            />
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
          {createError && <p className="text-sm text-red-500">{createError}</p>}
        </div>
      )}

      {!user && (
        <div className="card p-4">
          <p className="text-sm text-ink/60 dark:text-cream/60">
            <Link href="/login" className="text-teal underline font-semibold">
              Log in
            </Link>{" "}
            to create a new repository.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">Couldn&apos;t load repositories ({error}).</p>}

      {!songsLoading && !reposLoading && repos.length === 0 && (
        <p className="text-sm text-ink/50 dark:text-cream/50">
          No repositories yet —{" "}
          {user ? "create one above" : "log in to create one"}, or just type a name in the Repository field next time
          you add a song.
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {repos.map((r, i) => (
          <Link
            key={r.name}
            href={`/?repo=${encodeURIComponent(r.name)}`}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-white font-semibold bg-gradient-to-br ${
              CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]
            } shadow-md hover:opacity-90 transition-opacity`}
          >
            <FolderIcon />
            {r.name}
            <span className="text-xs font-bold bg-white/25 rounded-full px-2 py-0.5">{r.songCount}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function FolderIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
