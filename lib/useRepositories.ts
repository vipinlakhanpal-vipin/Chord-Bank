"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// A repository is just a name (e.g. "Vipin") songs can be tagged with — see
// Song.repository in lib/types.ts. This table exists only so a repository
// can be created ahead of any song being added to it (so it shows up as
// "Vipin · 0 songs" right away, same as the reference chip design), and so
// the name is spelled consistently everywhere it's picked from.

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

  return { names, loading, error, refresh, createRepository };
}
