const socket = io();

// Ask user for a custom name
const username = prompt("Enter your name:") || "Anonymous";

// Geolocation tracking
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { username, latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error.message);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

// ✅ Set up Leaflet map
/*
 const map = L.map("map").setView([0, 0], 20);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);
*/


// Satellite View layer (Esri World Imagery)
const map = L.map("map").setView([0, 0], 20);
L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: "© <a href='https://www.esri.com'>Esri</a>, USGS, NOAA"
}).addTo(map);

const markers = {};

// Receive location updates
socket.on("receive-location", (data) => {
    const { id, username, latitude, longitude } = data;

    // Small offset to avoid marker overlap
    const offset = Math.random() * 0.0001;
    const adjustedLat = latitude + offset;
    const adjustedLng = longitude + offset;

    // Update map view
    map.setView([adjustedLat, adjustedLng], 16);

    if (markers[id]) {
        // Update existing marker
        markers[id].setLatLng([adjustedLat, adjustedLng]);
        markers[id].setPopupContent(`User: ${username || id}`);
    } else {
        // Create new marker
        const marker = L.marker([adjustedLat, adjustedLng])
            .addTo(map)
            .bindPopup(`User: ${username || id}`)
            .openPopup();
        markers[id] = marker;
    }
});

// Handle user disconnection
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);
        delete markers[id];
        console.log(`Marker for user ${id} removed`);
    }
});

// Update online users count
socket.on("online-users", (userCount) => {
    const userCountElement = document.getElementById("userCountValue");
    if (userCountElement) {
        userCountElement.textContent = userCount;
    }
});