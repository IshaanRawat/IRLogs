var newLogButton = document.getElementById("new-log");
var newLogModal = document.getElementsByTagName("section")[0];

function toggleNewLogView(e) {
    e.preventDefault();
    if(newLogButton.className === "new-modal") {
        newLogButton.className = "close-modal";
        newLogModal.style.display = "block";
    } else if(newLogButton.className === "close-modal") {
        newLogButton.className = "new-modal";
        newLogModal.style.display = "none";
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

function createNewLog() {
    var main = document.getElementsByTagName("main")[0];
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
    
    var logText = document.createTextNode("Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas, obcaecati.");
    var logLocation = document.createTextNode("Lorem, ipsum dolor sit amet consectetur adipisicing elit.");
    imgLog.src = "src/media/demo.png";
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

var url = "https://httpbin.org/get";
var networkDataReceived = false;

fetch(url)
    .then((response) => {
        return response.json();
    }).then((data) => {
        networkDataReceived = true;
        clearLogs();
        createNewLog();
    });

if('caches' in window) {
    caches.match(url)
        .then((response) => {
            if(response) {
                return response.json();
            }
        })
        .then((res) => {
            if(!networkDataReceived) {
                clearLogs();
                createNewLog();
            }
        })
}