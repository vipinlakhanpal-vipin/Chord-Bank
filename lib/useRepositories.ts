"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// A repository is just a name (e.g. "Vipin") songs can be tagged with — see
// Song.repositories in lib/types.ts (a song can carry more than one). This
// table exists only so a repository can be created ahead of any song being
// added to it (so it shows up as "Vipin · 0 songs" right away, same as the
// reference chip design), and so the name is spelled consistently everywhere
// it's picked from.

export interface RepoRow {
  name: string;
  created_at: string;
}

export function useRepositories() {
  const [names, setNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("repositories").select("name").order("name", { ascending: true });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
      setNames((data as { name: string }[]).map((r) => r.name));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createRepository = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Give the repository a name." };
    const { error } = await supabase.from("repositories").upsert({ name: trimmed }, { onConflict: "name" });
    if (error) return { error: error.message };
    await refresh();
    return { error: null };
  }, [refresh]);

  // Renames a repository everywhere it's used: the repositories table row
  // itself, plus every song that currently carries the old name inside its
  // repositories array. Supabase's query builder has no "array contains and
  // replace one element" update, so this does it in two steps per song: read
  // every song tagged with the old name, then write back its array with the
  // old name swapped for the new one (rather than just appending, in case a
  // song was already in both — that shouldn't happen, but swapping in place
  // keeps it from silently de-duplicating oddly).
  const renameRepository = useCallback(
    async (oldName: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return { error: "Give the repository a name." };
      if (trimmed === oldName) return { error: null }; // no-op, nothing to do
      if (names.some((n) => n.toLowerCase() === trimmed.toLowerCase() && n !== oldName)) {
        return { error: `"${trimmed}" already exists — pick a different name.` };
      }

      const { data: matchingSongs, error: fetchError } = await supabase
        .from("songs")
        .select("id, repositories")
        .contains("repositories", [oldName]);
      if (fetchError) return { error: fetchError.message };

      for (const song of (matchingSongs ?? []) as { id: string; repositories: string[] | null }[]) {
        const nextRepos = (song.repositories ?? []).map((r) => (r === oldName ? trimmed : r));
        const { error: updateError } = await supabase
          .from("songs")
          .update({ repositories: nextRepos })
          .eq("id", song.id);
        if (updateError) return { error: updateError.message };
      }

      const { error: renameError } = await supabase
        .from("repositories")
        .update({ name: trimmed })
        .eq("name", oldName);
      if (renameError) return { error: renameError.message };

      await refresh();
      return { error: null };
    },
    [names, refresh]
  );

  // Deletes a repository everywhere it's used: pulls the name out of every
  // song's repositories array first (a song just loses that one tag, it's
  // never deleted itself), then removes the repositories table row. Order
  // matters — doing the row last means a failure partway through songs still
  // leaves the repository itself visible/retryable rather than vanishing
  // while songs still silently reference a name that no longer exists.
  const deleteRepository = useCallback(async (name: string) => {
    const { data: matchingSongs, error: fetchError } = await supabase
      .from("songs")
      .select("id, repositories")
      .contains("repositories", [name]);
    if (fetchError) return { error: fetchError.message };

    for (const song of (matchingSongs ?? []) as { id: string; repositories: string[] | null }[]) {
      const nextRepos = (song.repositories ?? []).filter((r) => r !== name);
      const { error: updateError } = await supabase
        .from("songs")
        .update({ repositories: nextRepos })
        .eq("id", song.id);
      if (updateError) return { error: updateError.message };
    }

    const { error: deleteError } = await supabase.from("repositories").delete().eq("name", name);
    if (deleteError) return { error: deleteError.message };

    await refresh();
    return { error: null };
  }, [refresh]);

  return { names, loading, error, refresh, createRepository, renameRepository, deleteRepository };
}
