import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";



// FIREBASE CONFIG

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



// HTML ELEMENTS

const button = document.getElementById("locationBtn");

const output = document.getElementById("output");

const broadcaster = document.getElementById("broadcaster");

const nameInput = document.getElementById("nameInput");



// DATABASE REFERENCE

const locationRef = ref(db, "location");



// BUTTON CLICK

button.addEventListener("click", () => {

    const userName = nameInput.value;



    if (userName.trim() === "") {

        alert("Please enter your name");

        return;

    }



    console.log("TRACKING STARTED");



    navigator.geolocation.watchPosition(

        (position) => {

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;



            console.log("LIVE GPS UPDATE");



            // SEND TO FIREBASE

            set(locationRef, {

                latitude: latitude,

                longitude: longitude,

                broadcaster: userName,

                timestamp: Date.now()

            })

            .then(() => {

                console.log("LIVE LOCATION SENT");

            })

            .catch((error) => {

                console.log(error);

            });

        },

        (error) => {

            console.log(error);

        },

        {

            enableHighAccuracy: true,

            maximumAge: 0,

            timeout: 5000

        }

    );

});



// RECEIVE LIVE DATA

onValue(locationRef, (snapshot) => {

    const data = snapshot.val();



    if (data) {

        output.textContent =

`Latitude: ${data.latitude}
Longitude: ${data.longitude}`;



        broadcaster.textContent =

`${data.broadcaster} is currently broadcasting location`;

    }

    else {

        output.textContent = "No location data yet.";

        broadcaster.textContent = "Nobody is broadcasting yet.";

    }

});