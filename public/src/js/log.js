var newLogButton = document.getElementById("new-log");
console.log(newLogButton);
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