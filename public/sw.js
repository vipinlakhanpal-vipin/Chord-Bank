// Minimal service worker — satisfies "installable app" requirements
// (Chrome/Edge "Install app" on desktop, "Add to Home Screen" on mobile)
// and lets the app open even on a flaky connection. No aggressive caching
// yet — safe to extend later with real offline support for starred songs.

const CACHE = "chord-bank-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() =>
      caches.match(event.request).then((res) => res || caches.match("/"))
    )
  );
});
