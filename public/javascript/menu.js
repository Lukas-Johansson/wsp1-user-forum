const button = document.querySelector(".navbar__button");

button.addEventListener("click", function (event) {
    console.log(event);
    const menu = document.querySelector(".navbar__collapse");
    console.log(menu);
    menu.classList.toggle("navbar__collapse--show");
});

function changeImage() {
    var image = document.getElementById('logochange');
    if (image.src.match("menuiconopned.svg")) {
        image.src = "/images/menuicon.svg";
    }
    else {
        image.src = "/images/menuiconopned.svg";
    }
}