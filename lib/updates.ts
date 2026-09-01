"use client";

// Two independent "new stuff" signals, both backed by localStorage so they
// survive a reload and only clear when you actually look:
//   - new songs added to the library since you last opened the Home/Updates button
//   - a new version of the app deployed (detected via the service worker
//     installing a fresh build while an older one is still controlling the tab)

const SONGS_KEY = "cb_seen_song_count";
const UPDATE_PENDING_KEY = "cb_update_pending";

export function hasNewSongs(currentCount: number): boolean {
  if (typeof window === "undefined") return false;
  const stored = window.localStorage.getItem(SONGS_KEY);
  if (stored === null) {
    // First run on this device — baseline silently, don't badge on day one.
    window.localStorage.setItem(SONGS_KEY, String(currentCount));
    return false;
  }
  return currentCount > Number(stored);
}

export function markSongsSeen(currentCount: number) {
  window.localStorage.setItem(SONGS_KEY, String(currentCount));
}

export function markDeployUpdatePending() {
  window.localStorage.setItem(UPDATE_PENDING_KEY, "1");
  window.dispatchEvent(new Event("cb:update-available"));
}

export function isDeployUpdatePending(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(UPDATE_PENDING_KEY) === "1";
}

export function clearDeployUpdatePending() {
  window.localStorage.removeItem(UPDATE_PENDING_KEY);
}
