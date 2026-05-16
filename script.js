import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    remove,
    onValue
}
from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";



// FIREBASE CONFIG

const firebaseConfig = {

    apiKey: "AIzaSyBi6J7XXCB-8wYP6U3VjDivJpbYZ0oeD2w",

    authDomain: "bus-radar-mvp.firebaseapp.com",

    databaseURL:
    "https://bus-radar-mvp-default-rtdb.asia-southeast1.firebasedatabase.app",

    projectId: "bus-radar-mvp",

    storageBucket: "bus-radar-mvp.firebasestorage.app",

    messagingSenderId: "784601192060",

    appId:
    "1:784601192060:web:549753dcb64972ef009bf9"
};



// INITIALIZE FIREBASE

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);



// HTML ELEMENTS

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");

const nameInput =
    document.getElementById("nameInput");

const broadcastersContainer =
    document.getElementById("broadcastersContainer");



// VARIABLES

let watchId = null;

let currentUser = "";



// START TRACKING

startBtn.addEventListener("click", () => {

    currentUser =
        nameInput.value.trim();



    if (currentUser === "") {

        alert("Please enter your name");

        return;
    }



    // PREVENT DUPLICATE WATCHERS

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);
    }



    const userRef =
        ref(db, `broadcasters/${currentUser}`);



    watchId =
        navigator.geolocation.watchPosition(

        (position) => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;



            // SEND DATA TO FIREBASE

            set(userRef, {

                name: currentUser,

                latitude: latitude,

                longitude: longitude,

                timestamp: Date.now()

            })

            .then(() => {

                console.log(
                    "Firebase write success"
                );

            })

            .catch((error) => {

                console.log(
                    "Firebase write failed"
                );

                console.log(error);

            });

        },

        (error) => {

            console.log("GPS ERROR");

            console.log(error);

        },

        {

            enableHighAccuracy: true,

            maximumAge: 0,

            timeout: 5000

        }

    );



    console.log(
        currentUser + " started broadcasting"
    );

});



// STOP TRACKING

stopBtn.addEventListener("click", () => {

    // STOP GPS WATCHER

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);

        watchId = null;
    }



    // REMOVE USER DATA

    if (currentUser !== "") {

        remove(
            ref(db,
            `broadcasters/${currentUser}`)
        );

        console.log(
            currentUser + " stopped broadcasting"
        );
    }

});



// RECEIVE LIVE BROADCASTERS

const broadcastersRef =
    ref(db, "broadcasters");



onValue(broadcastersRef, (snapshot) => {

    const data = snapshot.val();



    broadcastersContainer.innerHTML = "";



    // NO ACTIVE USERS

    if (!data) {

        broadcastersContainer.innerHTML =
            "No active broadcasters.";

        return;
    }



    // SHOW ALL USERS

    for (const user in data) {

        const broadcaster = data[user];



        const broadcasterDiv =
            document.createElement("div");



        broadcasterDiv.innerHTML = `

            <hr>

            <h3>
                ${broadcaster.name}
                is broadcasting
            </h3>

            <p>
                Latitude:
                ${broadcaster.latitude}
            </p>

            <p>
                Longitude:
                ${broadcaster.longitude}
            </p>

            <p>
                Timestamp:
                ${broadcaster.timestamp}
            </p>

        `;



        broadcastersContainer.appendChild(
            broadcasterDiv
        );

    }

});