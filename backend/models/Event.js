const mongoose = require("mongoose");

const EVENT_ENUM = ["IDLE", "STARTED", "STOPPED", "FAILED", "SUCCEEDED", "UNDEFINED"];
const TYPE_ENUM = ["INFO", "DEBUG", "ERROR", "ERROR_ELEMENT", "DEFINE_EVENT"];

const eventSchema = new mongoose.Schema({
  header: {
    stamp: {
      sec: Number,
      nanosec: Number,
    },
    frame_id: String,
  },

  origin_node: { type: String, required: true },

  source: {
    capability: String,
    provider: String,
    parameters: String,
  },

  target: {
    capability: String,
    provider: String,
    parameters: String,
  },

  thread_id: Number,

  // 🔤 Store as string enums
  event: {
    type: String,
    enum: EVENT_ENUM,
    required: true,
  },

  type: {
    type: String,
    enum: TYPE_ENUM,
    required: true,
  },

  content: String,
  pid: Number,

  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
    required: true,
    index: true,
  }

}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
module.exports.EVENT_ENUM = EVENT_ENUM;
module.exports.TYPE_ENUM = TYPE_ENUM;
