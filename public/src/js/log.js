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
}

newLogButton.addEventListener("click", toggleNewLogView);