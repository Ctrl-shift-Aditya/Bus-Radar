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



// INITIALIZE MAP (Leaflet + OpenStreetMap)

const map = L.map("map").setView(
    [12.9716, 77.5946], 13
);

L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
).addTo(map);



// HTML ELEMENTS

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");

const busNumberInput =
    document.getElementById("busNumberInput");

const statusText =
    document.getElementById("statusText");



// VARIABLES

let watchId = null;

let currentBusNumber = "";

const deviceId = crypto.randomUUID();

// Track markers: busNumber → Leaflet marker
const busMarkers = new Map();



// START BROADCASTING

startBtn.addEventListener("click", () => {

    currentBusNumber =
        busNumberInput.value.trim();

    if (currentBusNumber === "") {

        alert("Please enter a bus number");

        return;
    }



    // PREVENT DUPLICATE WATCHERS

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);
    }



    const busRef =
        ref(db, `buses/${currentBusNumber}`);



    watchId =
        navigator.geolocation.watchPosition(

            (position) => {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;



                // SEND DATA TO FIREBASE

                set(busRef, {

                    lat: lat,

                    lng: lng,

                    timestamp: Date.now(),

                    deviceId: deviceId

                })

                    .then(() => {

                        console.log(
                            "Location sent for bus " +
                            currentBusNumber
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



    // UPDATE UI STATE

    statusText.textContent =
        "Broadcasting bus " + currentBusNumber;

    statusText.classList.add("active");

    startBtn.disabled = true;

    busNumberInput.disabled = true;

    console.log(
        "Broadcasting bus " + currentBusNumber
    );

});



// STOP BROADCASTING

stopBtn.addEventListener("click", () => {

    // STOP GPS WATCHER

    if (watchId !== null) {

        navigator.geolocation.clearWatch(watchId);

        watchId = null;
    }



    // REMOVE BUS DATA FROM FIREBASE

    if (currentBusNumber !== "") {

        remove(
            ref(db,
                `buses/${currentBusNumber}`)
        );

        console.log(
            "Stopped broadcasting bus " +
            currentBusNumber
        );

        currentBusNumber = "";
    }



    // UPDATE UI STATE

    statusText.textContent = "Not broadcasting";

    statusText.classList.remove("active");

    startBtn.disabled = false;

    busNumberInput.disabled = false;

});



// RECEIVE LIVE BUS UPDATES & UPDATE MAP MARKERS

const busesRef = ref(db, "buses");

// Staleness thresholds (milliseconds)
const STALE_MS = 2 * 60 * 1000;   // 2 minutes
const DEAD_MS = 5 * 60 * 1000;    // 5 minutes

onValue(busesRef, (snapshot) => {

    const data = snapshot.val();

    const now = Date.now();

    // Track which buses are in this snapshot
    const activeBuses = new Set();



    if (data) {

        for (const busNumber in data) {

            const bus = data[busNumber];

            const age = now - bus.timestamp;



            // SKIP DEAD BUSES (older than 5 min)

            if (age > DEAD_MS) {

                continue;
            }



            activeBuses.add(busNumber);

            const latLng =
                L.latLng(bus.lat, bus.lng);

            const isStale = age > STALE_MS;



            if (busMarkers.has(busNumber)) {

                // MOVE EXISTING MARKER

                const marker =
                    busMarkers.get(busNumber);

                marker.setLatLng(latLng);

                // Update opacity for staleness
                marker.setOpacity(
                    isStale ? 0.4 : 1.0
                );

            } else {

                // CREATE NEW MARKER

                const marker = L.marker(latLng, {
                    opacity: isStale ? 0.4 : 1.0
                })
                    .addTo(map)
                    .bindTooltip(
                        "Bus " + busNumber,
                        {
                            permanent: true,
                            direction: "top",
                            className:
                                "bus-tooltip"
                        }
                    );

                busMarkers.set(busNumber, marker);

            }

        }

    }



    // REMOVE MARKERS FOR BUSES NO LONGER ACTIVE

    for (const [busNumber, marker]
        of busMarkers) {

        if (!activeBuses.has(busNumber)) {

            map.removeLayer(marker);

            busMarkers.delete(busNumber);

        }

    }

});