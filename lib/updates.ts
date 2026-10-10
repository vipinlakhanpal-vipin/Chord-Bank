"use client";

import { APP_VERSION } from "./version";

// Two independent "new stuff" signals, both backed by localStorage so they
// survive a reload and only clear when you actually look:
//   - new songs added to the library since you last opened the Home/Updates button
//   - a new version of the app deployed. Two separate ways this gets noticed:
//     (a) the tab was already open and a newer build showed up in the
//         background (ServiceWorkerRegister.tsx's version.json polling), or
//     (b) you were away entirely — closed the tab/app, came back later, and
//         the page you landed on was simply BUILT as the new version already,
//         so there was never a moment where an old build was running to
//         notice the change. checkVersionOnLoad() below is what catches (b):
//         it compares this build's version against the last one you actually
//         saw (localStorage, survives across visits) and flashes the banner
//         if they differ — which is exactly what was missing when you saw
//         v1.44, came back later, and landed straight on v1.46 with no toast.

const SONGS_KEY = "cb_seen_song_count";
const UPDATE_PENDING_KEY = "cb_update_pending";
const SEEN_VERSION_KEY = "cb_seen_version";

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

// Call once on app load. Compares the version this page was actually built
// with against the last version localStorage remembers you seeing. Covers
// the "came back after being away" case the version-polling effect can't:
// polling only catches a deploy that happens while a tab is already open and
// running an older build, so skipping straight from v1.44 to v1.46 across a
// closed tab produced no banner at all until this existed.
export function checkVersionOnLoad(): void {
  if (typeof window === "undefined") return;
  const stored = window.localStorage.getItem(SEEN_VERSION_KEY);
  if (stored === null) {
    // First run on this device — baseline silently, nothing to flash yet.
    window.localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
    return;
  }
  if (stored !== APP_VERSION) {
    window.localStorage.setItem(SEEN_VERSION_KEY, APP_VERSION);
    markDeployUpdatePending();
  }
}
