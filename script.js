import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";



// YOUR FIREBASE CONFIG

const firebaseConfig = {

    apiKey: "AIzaSyBi6J7XXCB-8wYP6U3VjDivJpbYZ0oeD2w",

    authDomain: "bus-radar-mvp.firebaseapp.com",

    databaseURL: "https://bus-radar-mvp-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "bus-radar-mvp",

    storageBucket: "bus-radar-mvp.firebasestorage.app",

    messagingSenderId: "784601192060",

    appId: "1:784601192060:web:549753dcb64972ef009bf9"
};



// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);



// GET HTML ELEMENTS

const button = document.getElementById("locationBtn");

const output = document.getElementById("output");



// BUTTON CLICK

button.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;



            console.log("GPS SUCCESS");

            console.log(latitude, longitude);



            // WRITE TO FIREBASE

            set(ref(db, "location"), {

                latitude: latitude,

                longitude: longitude

            })

            .then(() => {

                console.log("DATA SENT TO FIREBASE");

            })

            .catch((error) => {

                console.log("FIREBASE ERROR");

                console.log(error);

            });

        },

        (error) => {

            console.log("GPS ERROR");

            console.log(error);

        }

    );

});



// READ LIVE DATA

const locationRef = ref(db, "location");



onValue(locationRef, (snapshot) => {

    const data = snapshot.val();



    if (data) {

        output.textContent =

            `Latitude: ${data.latitude},
Longitude: ${data.longitude}`;

    }
    else {

        output.textContent = "No location data yet.";

    }

});