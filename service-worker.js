const CACHE_NAME = "todo-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/manifest.json",
  "/icon/android-chrome-192x192",
  "/icon/android-chrome-512x512",
  "/icon/apple-touch-icon.png",
  "/icon/favicon-16x16.png",
  "/icon/favicon-32x32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // Ritorna la risposta cacheata se esiste
      }
      return fetch(event.request); // Effettua la richiesta in rete se non è cacheata
    })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName); // Elimina le vecchie cache
          }
        })
      );
    })
  );
});
