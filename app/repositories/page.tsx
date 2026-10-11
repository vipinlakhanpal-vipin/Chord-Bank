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
  const { names, loading: reposLoading, error, createRepository, renameRepository, deleteRepository } =
    useRepositories();
  const { user } = useAuthUser();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Which repository's chip is currently showing its rename input, and what's
  // typed into it — only one at a time, keyed by the ORIGINAL name so the
  // input stays matched to the right chip even while you're mid-edit.
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  // Two-tap delete, same pattern as the song-delete button elsewhere in the
  // app — first tap arms it (turns red, asks to confirm), second tap within
  // the same chip actually deletes. Tapping any other chip's edit/delete, or
  // just moving on, de-arms it.
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // A repository can exist with zero songs (just created) or show up purely
  // because a song was tagged with a name nobody explicitly "created" first
  // — union both so nothing gets lost either way. A song can now carry more
  // than one repository, so this counts it once per repository it's in.
  const repos = useMemo(() => {
    const counts = new Map<string, number>();
    for (const name of names) counts.set(name, 0);
    for (const s of songs) {
      for (const name of s.repositories) counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, songCount]) => ({ name, songCount }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [names, songs]);

  const handleCreate = async () => {
    setCreateError(null);
    if (!newName.trim()) return setCreateError("Give the repository a name.");
    setCreating(true);
    const { error } = await createRepository(newName);
    setCreating(false);
    if (error) return setCreateError(error);
    setNewName("");
  };

  const startRename = (name: string) => {
    setRenaming(name);
    setRenameValue(name);
    setRenameError(null);
  };

  const cancelRename = () => {
    setRenaming(null);
    setRenameValue("");
    setRenameError(null);
  };

  const handleRename = async (oldName: string) => {
    setRenameError(null);
    if (!renameValue.trim()) return setRenameError("Give the repository a name.");
    setRenameSaving(true);
    const { error } = await renameRepository(oldName, renameValue);
    setRenameSaving(false);
    if (error) return setRenameError(error);
    cancelRename();
  };

  const handleDelete = async (name: string) => {
    if (confirmingDelete !== name) {
      setConfirmingDelete(name);
      setDeleteError(null);
      return;
    }
    setDeleteError(null);
    setDeleting(name);
    const { error } = await deleteRepository(name);
    setDeleting(null);
    setConfirmingDelete(null);
    if (error) setDeleteError(error);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* This page lives under Settings (see app/settings/page.tsx) — this
          link is what makes that visible instead of Repositories reading as
          its own separate top-level section. */}
      <Link
        href="/settings"
        className="self-start text-sm font-medium text-teal hover:underline flex items-center gap-1"
      >
        ← Settings
      </Link>
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
            {/* Always full-bright, even while empty/disabled — a dimmed
                pill here reads as "not there" against the dark theme,
                which is exactly the complaint that came in. Emptiness is
                caught on click via createError instead of a disabled look. */}
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-4 py-2 rounded-xl text-white font-semibold bg-gradient-to-br from-cyan-500 to-sky-700 shadow-md"
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
        {repos.map((r, i) =>
          renaming === r.name ? (
            <div
              key={r.name}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full bg-gradient-to-br ${
                CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]
              } shadow-md`}
            >
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(r.name);
                  if (e.key === "Escape") cancelRename();
                }}
                className="w-32 rounded-full px-2.5 py-1 text-sm text-ink bg-white/90 dark:bg-white/90"
              />
              <button
                type="button"
                onClick={() => handleRename(r.name)}
                disabled={renameSaving}
                title="Save new name"
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35 disabled:opacity-50"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={cancelRename}
                title="Cancel"
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/25 text-white hover:bg-white/35"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              key={r.name}
              className={`flex items-center gap-2 pl-4 pr-2 py-2.5 rounded-full text-white font-semibold bg-gradient-to-br ${
                CHIP_GRADIENTS[i % CHIP_GRADIENTS.length]
              } shadow-md`}
            >
              <Link href={`/?repo=${encodeURIComponent(r.name)}`} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <FolderIcon />
                {r.name}
                <span className="text-xs font-bold bg-white/25 rounded-full px-2 py-0.5">{r.songCount}</span>
              </Link>
              {user && (
                <>
                  <button
                    type="button"
                    onClick={() => startRename(r.name)}
                    title={`Rename "${r.name}"`}
                    className="w-6 h-6 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/30 transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(r.name)}
                    onBlur={() => confirmingDelete === r.name && setConfirmingDelete(null)}
                    disabled={deleting === r.name}
                    title={
                      confirmingDelete === r.name
                        ? `Tap again to permanently delete "${r.name}"`
                        : `Delete "${r.name}"`
                    }
                    className={`flex items-center justify-center rounded-full transition-colors disabled:opacity-50 ${
                      confirmingDelete === r.name
                        ? "px-2 h-6 text-[10px] font-bold bg-red-600/90 hover:bg-red-600 whitespace-nowrap"
                        : "w-6 h-6 bg-white/15 hover:bg-white/30"
                    }`}
                  >
                    {deleting === r.name ? "..." : confirmingDelete === r.name ? "Confirm?" : <TrashIcon />}
                  </button>
                </>
              )}
            </div>
          )
        )}
      </div>
      {renameError && <p className="text-sm text-red-500">{renameError}</p>}
      {deleteError && <p className="text-sm text-red-500">Couldn&apos;t delete that repository ({deleteError}).</p>}
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

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path
        d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path
        d="M4 7h16M9 7V4h6v3m-7 0 1 13h8l1-13"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
