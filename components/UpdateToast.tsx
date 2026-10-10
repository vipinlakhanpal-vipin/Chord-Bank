"use client";

import { useUpdateAvailable } from "@/lib/useUpdateAvailable";
import { APP_VERSION, LATEST_SUMMARY, formatVersion } from "@/lib/version";

// The old signal that a new version had shipped was a small red dot on the
// Refresh icon — easy to miss, and it never said what actually changed. This
// is the loud, hard-to-miss replacement: a banner that names the version and
// what's in it, right on screen, the moment a new deploy is detected, with
// one button that reloads straight into it. Sits above the mobile bottom
// nav and below the desktop navbar so it never gets clipped by either.
export default function UpdateToast() {
  const { available, acknowledge } = useUpdateAvailable();

  if (!available) return null;

  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-3 pointer-events-none"
      style={{ top: "calc(4.25rem + env(safe-area-inset-top))" }}
    >
      <div className="pointer-events-auto w-full sm:max-w-lg rounded-2xl shadow-xl ring-2 ring-white/50 border border-white/20 bg-gradient-to-br from-sky-600 to-blue-800 text-white px-4 py-3 flex items-start gap-3">
        <span className="text-xl leading-none shrink-0 mt-0.5">🚀</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold">What&apos;s new in {formatVersion(APP_VERSION)}</p>
          <p className="text-xs text-white/90 mt-0.5 leading-snug">{LATEST_SUMMARY}</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                acknowledge();
                window.location.reload();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-full bg-white text-blue-800 shadow-sm active:scale-95 transition-transform"
            >
              Upgrade now
            </button>
            <button
              onClick={acknowledge}
              className="text-xs font-semibold px-3 py-1.5 rounded-full text-white/80 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
