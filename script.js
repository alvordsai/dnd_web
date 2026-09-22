const boton = document.querySelector("#boton");
const mensaje = document.querySelector("#mensaje");

boton.addEventListener("click", function () {

    mensaje.textContent = "¡Tu JavaScript funciona!";

});