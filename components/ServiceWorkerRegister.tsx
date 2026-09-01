"use client";

import { useEffect } from "react";
import { markDeployUpdatePending } from "@/lib/updates";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // A new SW installing while this tab already has one active/controlling
        // means a new build was deployed since this tab was opened.
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
  return null;
}
