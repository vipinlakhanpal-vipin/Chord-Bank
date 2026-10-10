"use client";

import { useEffect } from "react";
import { markDeployUpdatePending } from "@/lib/updates";
import { APP_VERSION } from "@/lib/version";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // A new SW installing while this tab already has one active/controlling
        // means a new build was deployed since this tab was opened. This only
        // fires on the browser's own schedule though (often just once every
        // ~24h, or on a fresh navigation) — see the version-polling effect
        // below for the part that actually catches it promptly.
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              markDeployUpdatePending();
            }
          });
        });
      })
      .catch(() => {
        // Non-fatal — app still works without offline/installable support.
      });
  }, []);

  // The service worker check above is too lazy to rely on alone — browsers
  // only re-check it occasionally, so the "What's new" banner was only ever
  // showing up after you'd already manually refreshed, defeating the whole
  // point. This polls a tiny, always-fresh public/version.json (regenerated
  // from lib/version.ts on every build — see scripts/generate-version-json.js)
  // and compares it to the version this page was actually loaded with, so a
  // new deploy gets noticed on its own: right away if the app is open and
  // you switch back to it, and within ~90s either way.
  useEffect(() => {
    let cancelled = false;

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?t=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) return;
        const data: { version?: string } = await res.json();
        if (!cancelled && data.version && data.version !== APP_VERSION) {
          markDeployUpdatePending();
        }
      } catch {
        // Offline or a blip — just try again on the next tick/focus.
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, 90_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") checkVersion();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", checkVersion);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", checkVersion);
    };
  }, []);

  return null;
}
