self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing Service Worker...", event);
    event.waitUntil(caches.open("static")
        .then((cache) => {
            console.log("[Service Worker] Precaching App shell ...");
            cache.add("/src/js/app.js");
            cache.add("/src/js/feed.js");
            cache.add("/src/js/log.js");
            cache.add("/src/css/style.css");
            cache.add("/src/css/backpack.css");
            cache.add("/src/media/ir.svg");
            cache.add("/src/media/marker.svg");
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating Service Worker...", event);
    return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if(response) {
                    return response;
                } else {
                    return fetch(event.request);
                }
            })
    );
});