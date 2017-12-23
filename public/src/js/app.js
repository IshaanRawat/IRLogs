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

function configurePushSub() {
    if(!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker.ready
        .then((sw) => {
            return sw.pushManager.getSubscription()
        })
        .then((sub) => {
            if(sub === null) {
                // Create a new subscription
            } else {
                // We have a subscription
            }
        });
}

if("Notification" in window && "serviceWorker" in navigator) {
    enableNotificationBtn.style.display = "block";
    enableNotificationBtn.addEventListener("click", () => {
        Notification.requestPermission((result) => {
            console.log("User choice ", result);
            if(result !== "granted") {
                console.log("No notifications permission granted!");
            } else {
                enableNotificationBtn.style.display = "none";
                if("serviceWorker" in navigator) {
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
        });
    });
}