const socket = io();
let userId = null;
const markers = {};
const accuracyCircles = {};

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;
      socket.emit("send-location", { latitude, longitude, accuracy });
    },
    (error) => {
      console.error("Geolocation error:", error);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
} else {
  alert("Geolocation is not supported by this browser.");
}

// Initialize map centered on India (default view)
const map = L.map("map").setView([20.5937, 78.9629], 5);

// OpenStreetMap base layer (free & fast)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Handle incoming location data from server
socket.on("receive-location", (data) => {
  const { id, latitude, longitude, accuracy } = data;

  // Set current user ID
  if (!userId) userId = id;

  const latLng = [latitude, longitude];

  // Add or update marker
  if (markers[id]) {
    markers[id].setLatLng(latLng);
  } else {
    markers[id] = L.marker(latLng).addTo(map);
  }

  // Add or update accuracy circle
  if (accuracyCircles[id]) {
    accuracyCircles[id].setLatLng(latLng).setRadius(accuracy);
  } else {
    accuracyCircles[id] = L.circle(latLng, {
      radius: accuracy,
      color: "#136aec",
      fillColor: "#136aec",
      fillOpacity: 0.2,
      weight: 1,
    }).addTo(map);
  }

  // Only center map for the current device
  if (id === userId) {
    map.setView(latLng, 18);
  }
});

// Remove user marker/circle on disconnect
socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
  if (accuracyCircles[id]) {
    map.removeLayer(accuracyCircles[id]);
    delete accuracyCircles[id];
  }
});
