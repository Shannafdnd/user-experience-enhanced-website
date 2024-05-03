const 
    nav = document.querySelector("nav.categories-nav"),
    menuButton = document.querySelector(".menu-button"),
    sharesCounter = document.getElementById("shares"),
    alertContainer = document.getElementById("alert-container"),
    alertMessage = document.getElementById("alert-message");

menuButton.addEventListener("click", () => {
    nav.classList.toggle("closed");
})

function betterAlert(message) { // Deze functie laat een custom alert zien
    alertContainer.classList.remove("hidden");
    alertMessage.innerText = message;
    setTimeout(() => alertContainer.classList.add("hidden"), 2000);
}

function share(event) {
    fetch(window.top.location, {method: "POST"});
    sharesCounter.innerText++; // 1 bij de share counter optellen

    if (navigator.share) { // deze functie wordt niet door elke browser ondersteunt
        navigator.share({url: window.top.location});
    } else {
        navigator.clipboard.writeText(window.top.location);
        betterAlert("URL Gekopieërd!")
    }
    event.preventDefault(); 
}

// Bronnen
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
// https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault
// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share 
// https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText 