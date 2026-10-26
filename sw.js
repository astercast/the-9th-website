/* The Kept Threshold (CANON §III, wave 12): a same-origin keeping.
   Once visited, the place works offline. This worker makes no
   external request of its own and answers for no other origin;
   CANON §IX (no external requests) holds absolute. */
const V = "ninth-v14";
const CORE = ["/", "/assets/css/main.css", "/assets/css/rose.css",
              "/assets/js/main.js", "/assets/js/deep.js", "/assets/js/moon.js",
              "/assets/js/starsky.js", "/assets/js/sun.js",
              "/assets/js/planets.js", "/assets/js/skyrender.js",
              "/assets/js/mirrorsky.js",
              "/data/sky.json",
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
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  /* Round 3: "/index.html" is a redirect to "/". A kept redirect cannot
     answer a page load, so the worker steps aside and lets the browser
     follow it. */
  if (e.request.mode === "navigate" && url.pathname === "/index.html") return;
  e.respondWith(
    caches.open(V).then((c) =>
      c.match(e.request).then((hit) => {
        /* Round 3: ask the network to check, not the browser's own
           day-long copy ("no-cache" revalidates, and a 304 stays cheap).
           Without this the refresh below re-read a stale file for up to
           24 hours and the HTML could meet old scripts. */
        const net = fetch(e.request, { cache: "no-cache" })
          .then((res) => {
            if (res.ok && !res.redirected) c.put(e.request, res.clone());
            return res;
          })
          .catch(() => hit || (e.request.mode === "navigate" ? c.match("/") : Response.error()));
        e.waitUntil(net.catch(() => {}));
        return hit || net;
      })
    )
  );
});
