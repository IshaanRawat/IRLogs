var deferredPrompt;

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

//FETCH API for GET
fetch("https://httpbin.org/ip").then((response) => {
    console.log(response);
    return response.json();
}).then((data) => {
    console.log(data);  
}).catch((err) => {
    console.log(err);
});

//FETCH API for POST
fetch("https://httpbin.org/post", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    },
    body: JSON.stringify({code: "Hey there"})
}).then((response) => {
    console.log(response);
    return response.json();
}).then((data) => {
    console.log(data);  
}).catch((err) => {
    console.log(err);
});