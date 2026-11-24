// Offline support: cache the app and the libraries it loads so Sealed opens with no network.
// Only GET requests for code and assets are cached. Model calls, Firestore and sign-in are never cached.
const VERSION = "sealed-v9";
const SHELL = [
  "./", "index.html", "share.html", "demo-chat.html", "css/app.css", "icon.svg", "manifest.webmanifest",
  "js/app.js", "js/firebase.js", "js/firebase-config.js", "js/redact.js", "js/ingest.js", "js/store.js",
  "js/health.js", "js/share.js",
];
const LIBS = [/^https:\/\/www\.gstatic\.com\/firebasejs\//, /^https:\/\/cdn\.jsdelivr\.net\/npm\/pdfjs-dist@/];

// One cache key per file, whatever the query string: "/?v=3", "/" and "/index.html" are all the app page.
// This keeps a cached page and its code from different versions apart.
function keyFor(url) {
  const u = new URL(url);
  const scope = new URL(self.registration.scope);
  let path = u.pathname;
  if (path === scope.pathname || path === scope.pathname.replace(/\/$/, "")) path = scope.pathname + "index.html";
  if (!/\.[a-z0-9]+$/i.test(path)) path += ".html"; // servers that drop ".html" (share, demo-chat)
  return u.origin + path;
}

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(VERSION)
      .then((c) => Promise.all(SHELL.map((f) => fetch(f, { cache: "no-store" }).then((r) => r.ok && c.put(keyFor(new URL(f, self.registration.scope).href), r)).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
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
  const key = keyFor(req.url);
  ev.respondWith(fetch(req, { cache: "no-cache" }).then((res) => {
    if (res.ok && !res.redirected) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(key, copy)); }
    return res;
  }).catch(() => caches.match(key).then((hit) => hit || (req.mode === "navigate" ? caches.match(keyFor(self.registration.scope)) : undefined))));
});
