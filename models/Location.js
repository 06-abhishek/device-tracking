const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    timestamp: { type: Date, default: Date.now }
  },
  locationHistory: [
    {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      timestamp: { type: Date, default: Date.now }
    }
  ],
  status: String,
  updatedAt: Date,
});

module.exports = mongoose.model("Location", locationSchema);
