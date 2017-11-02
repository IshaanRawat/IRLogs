var deferredPrompt;

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