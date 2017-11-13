self.addEventListener("install", (event) => {
    console.log("[Service Worker] Installing Service Worker...", event);
    event.waitUntil(
        caches.open("static-v2")
            .then((cache) => {
                console.log("[Service Worker] Precaching App Shell ...");
                cache.addAll([
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
                ]);
            })
    );
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activating Service Worker...", event);
    event.waitUntil(
        caches.keys()
            .then((keyList) => {
                return Promise.all(keyList.map((key) => {
                    if(key !== "static-v2" && key !== "dynamic") {
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
                            return caches.open("dynamic")
                                .then((cache) => {
                                    cache.put(event.request.url, res.clone());
                                    return res;
                                })
                        });
                }
            })
    );
});