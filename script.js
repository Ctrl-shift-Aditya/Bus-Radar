const button = document.getElementById("locationBtn");
const output = document.getElementById("output");

button.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            output.textContent =
                `Latitude: ${latitude}, Longitude: ${longitude}`;
        },

        (error) => {
            output.textContent = error.message;
        }

    );

});