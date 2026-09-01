"use client";

// Heart-toggle favourites, stored locally so they survive a reload.
// Cross-device sync isn't implemented — this is per-browser, same as the
// "seen songs"/"update pending" flags in lib/updates.ts.

const KEY = "cb_favourites";

export function getFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isFavourite(id: string): boolean {
  return getFavourites().includes(id);
}

// Returns the new state (true = now favourited).
export function toggleFavourite(id: string): boolean {
  const current = getFavourites();
  const idx = current.indexOf(id);
  const next = idx >= 0 ? current.filter((x) => x !== id) : [...current, id];
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("cb:favourites-changed"));
  return idx < 0;
}
