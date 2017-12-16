importScripts("/src/js/idb.js");
importScripts("/src/js/util.js");

var CACHE_STATIC_VERSION = "static-v6";
var CACHE_DYNAMIC_VERSION = "dynamic-v2";
var cachedPages = [
    "/",
    "/index.html",
    "/offline.html",
    "/src/js/app.js",
    "/src/js/log.js",
    "/src/js/idb.js",
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
    var url = "https://irlogs-f4861.firebaseio.com/posts";
    if(event.request.url.indexOf(url) > -1) {
        event.respondWith(fetch(event.request)
                .then(function(res) {
                    var clonedRes = res.clone();
                    clonedRes.json()
                        .then((data) => {
                            for(let key in data) {
                                writeData("posts", data[key]);
                            }
                        });
                    return res;
                })
        );
    } else if (cachedPages.includes(event.request.url)) {
        event.respondWith(
            caches.match(event.request)
        );
    } else {
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
                            })
                            .catch((err) => {
                                return caches.open(CACHE_STATIC_VERSION)
                                    .then((cache) => {
                                        if(event.request.headers.get("accept").includes("text/html")) {
                                            return cache.match("/offline.html");
                                        }
                                    })
                            });
                    }
                })
        );
    }
});