import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    onValue
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";



const firebaseConfig = {

    apiKey: "AIzaSyBi6J7XXCB-8wYP6U3VjDivJpbYZ0oeD2w",

    authDomain: "bus-radar-mvp.firebaseapp.com",

    databaseURL: "https://bus-radar-mvp-default-rtdb.firebaseio.com",

    projectId: "bus-radar-mvp",

    storageBucket: "bus-radar-mvp.firebasestorage.app",

    messagingSenderId: "784601192060",

    appId: "1:784601192060:web:549753dcb64972ef009bf9"
};



const app = initializeApp(firebaseConfig);

const db = getDatabase(app);



const button = document.getElementById("locationBtn");

const output = document.getElementById("output");



button.addEventListener("click", () => {

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;

            const longitude = position.coords.longitude;



            set(ref(db, "location"), {

                latitude: latitude,

                longitude: longitude

            });

        }

    );

});



const locationRef = ref(db, "location");



onValue(locationRef, (snapshot) => {

    const data = snapshot.val();



    output.textContent =

        `Latitude: ${data.latitude},
         Longitude: ${data.longitude}`;

});