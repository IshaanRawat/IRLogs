importScripts("/src/js/idb.js");
importScripts("/src/js/util.js");

var CACHE_STATIC_VERSION = "static-v20";
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
                clearAllData("logs")
                    .then(function() {
                        return clonedRes.json()
                    })
                    .then((data) => {
                        for(let key in data) {
                            writeData("logs", data[key]);
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

self.addEventListener("sync", (event) => {
    console.log("[Service Worker] Background syncing...", event);
    if (event.tag === "sync-new-logs") {
        console.log("[Service Worker] Syncing new logs...");
        event.waitUntil(
            readAllData("sync-logs")
            .then((data) => {
                const url = "https://us-central1-irlogs-f4861.cloudfunctions.net/storeLogsData";
                for(let dt of data) {
                    var postData = new FormData();
                    postData.append("id", dt.id);
                    postData.append("title", dt.title);
                    postData.append("location", dt.location);
                    postData.append("image", dt.logCapture, dt.id + ".png");
                    fetch(url, {
                        method: "POST",
                        body: postData
                    })
                    .then((res) => {
                        console.log("Sent data to the server.", res);
                        if (res.ok) {
                            res.json()
                                .then((resData) => {
                                    deleteData("sync-logs", resData.id);
                                });
                        }
                    })
                    .catch((err) => {
                        console.log("Error sending the data to the server.");
                    });
                }
            })
        );
    }
});

self.addEventListener("notificationclick", (event) => {
    const notification = event.notification;
    const action = event.action;
    console.log(notification);

    if(action === "confirm") {
        console.log("Confirm was chosen.");
        notification.close();
    } else {
        console.log(action);
        event.waitUntil(
            clients.matchAll()
                .then((clis) => {
                    var client = clis.find((c) => {
                        return c.visibilityState === "visible";
                    });
                    if(client !== undefined) {
                        client.navigate(notification.data.location);
                        client.focus();
                    } else {
                        clients.openWindow(notification.data.location);
                    }
                    notification.close();
                })
        );
    }
});

self.addEventListener("notificationclose", (event) => {
    console.log("Notification was closed! ", event);
});

self.addEventListener("push", (event) => {
    console.log("[Service Worker] Push Notification received!", event);
    var data = {title: "New!", content: "Something New Happened!", location: "/"};
    if(event.data) {
        data = JSON.parse(event.data.text());
    }
    var options = {
        body: data.content,
        icon: "/src/media/icons/android-icon-96x96.png",
        badge: "/src/media/icons/android-icon-96x96.png",
        data: {
            location: data.location
        }
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});