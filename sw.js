/* ============================================================================
 * Service Worker der Antwort-Seite.
 *
 * Cache-first: Nach dem ersten Besuch läuft die Seite komplett offline —
 * auch mit neuen Fragment-Parametern (das Fragment erreicht den Server
 * ohnehin nie). Bei einer neuen Version die CACHE-Konstante hochzählen.
 * ========================================================================== */

const CACHE = "antwortseite-v4";
const DATEIEN = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (treffer) =>
        treffer ??
        fetch(e.request).catch(() =>
          // Navigation offline ohne Cache-Treffer → Seite selbst liefern.
          e.request.mode === "navigate"
            ? caches.match("./index.html")
            : Response.error(),
        ),
    ),
  );
});
