// Offline support: cache the app and the libraries it loads so Sealed opens with no network.
// Only GET requests for code and assets are cached. Model calls, Firestore and sign-in are never cached.
const VERSION = "sealed-v4";
const SHELL = [
  "./", "index.html", "css/app.css", "icon.svg", "manifest.webmanifest",
  "js/app.js", "js/firebase.js", "js/firebase-config.js", "js/redact.js", "js/ingest.js", "js/store.js",
];
const LIBS = [/^https:\/\/www\.gstatic\.com\/firebasejs\//, /^https:\/\/cdn\.jsdelivr\.net\/npm\/pdfjs-dist@/];

self.addEventListener("install", (ev) => {
  ev.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (ev) => {
  const req = ev.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const lib = LIBS.some((re) => re.test(req.url));
  if (!sameOrigin && !lib) return;
  if (url.pathname.includes("/private-test/")) return; // never cache test reports
  if (lib) {
    // Versioned libraries never change: cache first.
    ev.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
      return res;
    })));
    return;
  }
  // The app itself: network first so updates arrive, cache when offline.
  ev.respondWith(fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html"))));
});
