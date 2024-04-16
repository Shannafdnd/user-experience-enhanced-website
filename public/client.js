const nav = document.querySelector("nav.categories-nav");
const menuButton = document.querySelector(".menu-button");
const sharesCounter = document.getElementById("shares");
const link = encodeURI(window.location.href);
const alertContainer = document.getElementById("alert-container");
const alertMessage = document.getElementById("alert-message");

menuButton.addEventListener("click", () => {
    console.log("x")
    nav.classList.toggle("closed");
})

function betterAlert(message) { // Deze functie laat een custom alert zien
    alertContainer.classList.remove("hidden");
    alertMessage.innerText = message;
    setTimeout(() => alertContainer.classList.add("hidden"), 2000);
}

function share(e) { // e is event
    e.preventDefault(); // niet refreshen
    fetch(window.top.location, {method: "POST"}); // ipv daarvan in de achtergrond post request sturen
    sharesCounter.innerText++; // 1 bij de share counter optellen

    if (navigator.share) { // deze functie wordt niet door elke browser ondersteunt
        navigator.share({url: window.top.location});
    } else {
        navigator.clipboard.writeText(window.top.location);
        betterAlert("URL Gekopieërd!")
    }
}