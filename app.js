const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const http = require("http");
const path = require("path");
const socketio = require("socket.io");

const Location = require("./models/Location");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Set view engine and static files
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// WebSocket logic
io.on("connection", (socket) => {
  console.log("Device connected:", socket.id);

  socket.on("send-location", async (data) => {
    const { latitude, longitude, accuracy } = data;

    try {
      await Location.findOneAndUpdate(
        { socketId: socket.id },
        {
          latitude,
          longitude,
          accuracy,
          status: "online",
          updatedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      io.emit("receive-location", {
        id: socket.id,
        latitude,
        longitude,
        accuracy,
      });
    } catch (err) {
      console.error("Error saving location:", err);
    }
  });

  socket.on("disconnect", async () => {
    console.log("Device disconnected:", socket.id);
    io.emit("user-disconnected", socket.id);

    try {
      await Location.findOneAndUpdate(
        { socketId: socket.id },
        { status: "offline", updatedAt: new Date() }
      );
    } catch (err) {
      console.error("Error updating status on disconnect:", err);
    }
  });
});

// Simple home route
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Server is running on PORT", PORT);
});
