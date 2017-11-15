var CACHE_STATIC_VERSION = "static-v3";
var CACHE_DYNAMIC_VERSION = "dynamic-v2";
var cachedPages = [
    "/",
    "/index.html",
    "/src/js/app.js",
    "/src/js/log.js",
    "/src/js/promise.js",
    "/src/js/fetch.js",
    "/src/css/style.css",
    "/src/css/backpack.css",
    "/src/media/marker.svg",
    "/src/media/ir.svg",
    "https://fonts.googleapis.com/css?family=Nunito:400,600,900"
];

self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing Service Worker...", event);
    event.waitUntil(
        caches.open(CACHE_STATIC_VERSION)
            .then((cache) => {
                console.log("[Service Worker] Precaching App Shell ...");
                cache.addAll(cachedPages);
            })
    );
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating Service Worker...", event);
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if(key !== CACHE_STATIC_VERSION && key !== CACHE_DYNAMIC_VERSION) {
                        console.log("[Service Worker] Removing old cache " + key + "...");
                        return caches.delete(key);
                    }
                }));
            })
    );
    return self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    // console.log("[Service Worker] Fetching something...", event);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if(response) {
                    return response;
                } else {
                    return fetch(event.request)
                        .then((res) => {
                            return caches.open(CACHE_DYNAMIC_VERSION)
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        });
                }
            })
    );
});