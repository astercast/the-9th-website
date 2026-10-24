/* The Kept Threshold (CANON §III, wave 12): a same-origin keeping.
   Once visited, the place works offline. This worker makes no
   external request of its own and answers for no other origin;
   CANON §IX (no external requests) holds absolute. */
const V = "ninth-v13";
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
/* Round 2 (2026-10-24): stale-while-revalidate. The cache answers at
   once, the network refreshes it behind the answer, and the next
   visit stands on the new files; the place no longer waits on a
   manual version bump to reach returning visitors. */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(V).then((c) =>
      c.match(e.request).then((hit) => {
        const net = fetch(e.request)
          .then((res) => {
            if (res.ok) c.put(e.request, res.clone());
            return res;
          })
          .catch(() => hit);
        return hit || net;
      })
    )
  );
});
