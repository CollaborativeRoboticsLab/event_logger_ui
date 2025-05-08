const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  serial: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Session", sessionSchema);
