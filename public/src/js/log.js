const newLogButton = document.getElementById("new-log");
const newLogModal = document.getElementsByTagName("section")[0];
const main = document.getElementsByTagName("main")[0];
const form = document.querySelector("form");
const inputLog = document.getElementById("new-text");
const inputLocation = document.getElementById("new-location");

function toggleNewLogView(e) {
    e.preventDefault();
    if(newLogButton.className === "new-modal") {
        newLogButton.className = "close-modal";
        newLogModal.style.transform = "translateX(0) translateY(0)";
        newLogModal.style.width = "100vw";
    } else if(newLogButton.className === "close-modal") {
        newLogButton.className = "new-modal";
        newLogModal.style.transform = "translateX(100vw) translateY(100vh)";
        newLogModal.style.width = "0vw";
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
    readAllData("posts")
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
});