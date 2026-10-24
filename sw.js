/* The Kept Threshold (CANON §III, wave 12): a same-origin keeping.
   Once visited, the place works offline. This worker makes no
   external request of its own and answers for no other origin;
   CANON §IX (no external requests) holds absolute. */
const V = "ninth-v12";
const CORE = ["/", "/index.html", "/assets/css/main.css", "/assets/css/rose.css",
              "/assets/js/main.js", "/assets/js/deep.js",
              "/data/v1/wishes.json", "/data/v1/letters.json",
              "/data/v1/scale.json", "/data/v1/whispers.json"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((res) => {
    const copy = res.clone();
    caches.open(V).then((c) => c.put(e.request, copy));
    return res;
  })));
});
