"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Genre, GENRES, Song } from "@/lib/types";

// Your song library now lives in Supabase, not in this codebase — you add
// every song yourself through the Add Song screen, pasting in whatever chart
// text you've sourced. Nothing here generates or stores lyrics on its own.

interface SongRow {
  id: string;
  title: string;
  singers: string[];
  movie: string | null;
  year: number;
  language: string;
  youtube_id: string | null;
  chart: string[];
  genres: string[] | null;
  tags: string[] | null;
  added_via: string;
  repository: string | null;
}

function isGenre(value: string): value is Genre {
  return (GENRES as readonly string[]).includes(value);
}

function rowToSong(row: SongRow): Song {
  return {
    id: row.id,
    title: row.title,
    singers: row.singers ?? [],
    movie: row.movie ?? undefined,
    year: row.year,
    language: "Hindi",
    youtubeId: row.youtube_id ?? undefined,
    chart: row.chart ?? [],
    genres: (row.genres ?? []).filter(isGenre),
    tags: row.tags ?? undefined,
    addedVia: (row.added_via as Song["addedVia"]) ?? "manual",
    repository: row.repository ?? undefined,
  };
}

/** Every song in your library, fetched from Supabase. */
export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("title", { ascending: true });
      if (error) {
        setError(error.message);
        setSongs([]);
      } else {
        setError(null);
        setSongs((data as SongRow[]).map(rowToSong));
      }
    } catch (err) {
      // Network failure, blocked request, etc. — supabase-js usually returns
      // these as `error` above, but a thrown exception here shouldn't leave
      // the UI stuck on "Loading" forever.
      setError(err instanceof Error ? err.message : "Couldn't reach the song library.");
      setSongs([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { songs, loading, error, refresh };
}

/** One song by id, fetched from Supabase — for the song detail/edit pages. */
export function useSong(id: string | undefined) {
  const [song, setSong] = useState<Song | null | undefined>(undefined); // undefined = loading, null = not found
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setSong(undefined);
    try {
      const { data, error } = await supabase.from("songs").select("*").eq("id", id).maybeSingle();
      if (error) {
        setError(error.message);
        setSong(null);
      } else {
        setError(null);
        setSong(data ? rowToSong(data as SongRow) : null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't reach the song library.");
      setSong(null);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { song, error, refresh };
}
