const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  latitude: Number,
  longitude: Number,
  accuracy: Number,
  status: String,
  updatedAt: Date,
});

module.exports = mongoose.model("Location", locationSchema);
