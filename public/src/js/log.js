const newLogButton = document.getElementById("new-log");
const newLogModal = document.getElementsByTagName("section")[0];
const main = document.getElementsByTagName("main")[0];
const form = document.querySelector("form");
const inputLog = document.getElementById("new-text");
const inputLocation = document.getElementById("new-location");
const videoPlayer = document.querySelector("section video");
const canvasElement = document.querySelector("section canvas");
const captureButton = document.querySelector("#capture");
const imagePicker = document.querySelector("#new-image");
const imagePickerContainer = document.querySelector("#image-picker");
var logCapture;

function initialiseMedia() {
    if(!("mediaDevices" in navigator)) {
        navigator.mediaDevices = {};
    }
    if(!("getUserMedia" in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function (constraints) {
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
            if(!getUserMedia) {
                return Promise.reject(new Error("getUserMedia is not implemented."));   
            }
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }

    navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = "block";
        })
        .catch((err) => {
            imagePickerContainer.style.display = "block";
        });
}

captureButton.addEventListener("click", function (event) {
    canvasElement.style.display = "block";
    videoPlayer.style.display = "none";
    captureButton.style.display = "none";
    var context = canvasElement.getContext("2d");
    context.drawImage(videoPlayer, 0, 0, canvasElement.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width));
    videoPlayer.srcObject.getVideoTracks().forEach(track => {
        track.stop();
    });
    logCapture = dataURItoBlob(canvasElement.toDataURL());
})

function toggleNewLogView(e) {
    if(e) {
        e.preventDefault();
    }
    if(newLogButton.className === "new-modal") {
        newLogButton.className = "close-modal";
        newLogModal.style.transform = "translateX(0) translateY(0)";
        newLogModal.style.width = "100vw";
        initialiseMedia();
    } else if(newLogButton.className === "close-modal") {
        newLogButton.className = "new-modal";
        newLogModal.style.transform = "translateX(100vw) translateY(100vh)";
        newLogModal.style.width = "0vw";
        imagePickerContainer.style.display = "none";
        videoPlayer.style.display = "none";
        canvasElement.style.display = "block";
    }

    //Checking if deferredPrompt is there
    //Then show the install to homescreen
    //after clicking the + button
    //after 1 sec
    if(deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            console.log(choiceResult.outcome);
            if(choiceResult.outcome === "dismissed") {
                console.log("User dismissed the prompt.");
            } else {
                console.log("User added to the homescreen.");
            }
        });
        deferredPrompt = null;
    }
}

newLogButton.addEventListener("click", toggleNewLogView);

function createNewLog(post) {
    var log = document.createElement("article");
    var face = document.createElement("div");
    var details = document.createElement("p");
    var location = document.createElement("div");
    var imgLog = document.createElement("img");
    var imgMarker = document.createElement("img");
    var span = document.createElement("span");

    face.className = "log-face";
    details.className = "log-details";
    location.className = "log-location";
    
    var logText = document.createTextNode(post.title);
    var logLocation = document.createTextNode(post.location);
    imgLog.src = post.image;
    imgMarker.src = "src/media/marker.svg";

    span.appendChild(logLocation);
    details.appendChild(logText);
    location.appendChild(imgMarker);
    location.appendChild(span);
    face.appendChild(imgLog);
    log.appendChild(face);
    log.appendChild(details);
    log.appendChild(location);
    main.appendChild(log);
}

function clearLogs() {
    while(main.hasChildNodes()) {
        main.removeChild(main.lastChild);
    }
}

function updateUI(data) {
    clearLogs();
    for(let post of data) {
        createNewLog(post);
    }
}

var postsURL = "https://irlogs-f4861.firebaseio.com/posts.json";
var networkDataReceived = false;

fetch(postsURL)
    .then((response) => {
        return response.json();
    }).then((data) => {
        console.log("From web", data);
        networkDataReceived = true;
        var dataArr = [];
        for(let key in data) {
            dataArr.push(data[key]);
        }
        updateUI(dataArr);
    });

if('indexedDB' in window) {
    readAllData("logs")
        .then(function(data) {
            if(!networkDataReceived) {
                console.log("From cache", data);
                updateUI(data);
            }
        });
}

form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (inputLog.value.trim() === "" || inputLocation.value.trim() === "") {
        alert("Please enter valid data.");
        return;
    }

    toggleNewLogView();

    if ('serviceWorker' in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready
            .then((sw) => {
                let log = {
                    id: new Date().toISOString(),
                    title: inputLog.value,
                    location: inputLocation.value,
                    logCapture: logCapture
                };
                writeData("sync-logs", log)
                    .then(() => {
                        return sw.sync.register("sync-new-logs");
                    })
                    .then(() => {
                        alert("Your log has been saved for syncing.");
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            });
    }
});