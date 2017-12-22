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

if("Notification" in window) {
    enableNotificationBtn.style.display = "block";
    enableNotificationBtn.addEventListener("click", () => {
        Notification.requestPermission((result) => {
            console.log("User choice ", result);
            if(result !== "granted") {
                console.log("No notifications permission granted!");
            } else {
                
            }
        });
    });
}