var deferredPrompt;
var enableNotificationBtn = document.querySelector("#notification-btn");

if(!window.Promise) {
    window.Promise = Promise;
}

if('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js").then(() => {
        console.log("Service Worker registered.");
    });
}

//Changing the time when add to homescreen appears
//Disabling the default timing and saving the prompt
//in a deferredPrompt variable
window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    console.log("beforeinstallprompt fired");
    deferredPrompt = prompt;
    return false;
});

function askForNotificationPermission() {
    Notification.requestPermission((result) => {
        console.log("User choice ", result);
        if(result !== "granted") {
            console.log("No notifications permission granted!");
        } else {
            configurePushSub();
        }
    });
}

function displayConfirmNotification() {
    if("serviceWorker" in navigator) {
        enableNotificationBtn.style.display = "none";
        navigator.serviceWorker.ready
            .then((sw) => {
                sw.showNotification("Successfully subscribed!", {
                    body: "You have successfully subscribed to our notification services.",
                    icon: "/src/media/icons/android-icon-96x96.png",
                    image: "/src/media/demo.png",
                    badge: "/src/media/icons/android-icon-96x96.png",
                    vibrate: [100, 50, 200],
                    tag: "confirm-notification",
                    renotify: true,
                    actions: [
                        {action: "confirm", title: "Okay", icon: "/src/media/icons/android-icon-96x96.png"},
                        {action: "cancel", title: "Cancel", icon: "/src/media/icons/android-icon-96x96.png"}
                    ]
                });
            });
    }
}

function configurePushSub() {
    if(!("serviceWorker" in navigator)) {
        return;
    }

    var sW;
    navigator.serviceWorker.ready
        .then((sw) => {
            sW = sw;
            return sw.pushManager.getSubscription()
        })
        .then((sub) => {
            if(sub === null) {
                // Create a new subscription
                const vapidPublicKey = "BBTlbc29fuuQW8m18NEZ01AK2rl_IpgES37cYzGGwO0gTKCoozliJNhkAbHcMqcTg-hFnrv-77-BwBxktOyn-bE";
                var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                return sW.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey
                });
            } else {
                // We have a subscription
            }
        })
        .then((newSub) => {
            return fetch("https://irlogs-f4861.firebaseio.com/subscriptions.json", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(newSub)
            });
        })
        .then((res) => {
            if(res.ok) {
                displayConfirmNotification();
            }
        })
        .catch((err) => {
            console.log(err);
        });
}

if("Notification" in window && "serviceWorker" in navigator) {
    enableNotificationBtn.style.display = "block";
    enableNotificationBtn.addEventListener("click", askForNotificationPermission);
}