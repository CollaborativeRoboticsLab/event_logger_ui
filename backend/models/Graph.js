const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
  capability: String,
  provider: String,
  state: {
    type: String,
    enum: ["idle", "executing", "complete", "failed"],
    default: "idle",
  },
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  from: nodeSchema,
  to: nodeSchema,
  activated: { type: Number, default: 0 },
}, { _id: false });

const eventLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  source: nodeSchema,
  target: nodeSchema,
  action: String, // "activate" or "fail"
  edgeFound: Boolean,
}, { _id: false });

const graphSchema = new mongoose.Schema({
  graphId: { type: String, required: true, unique: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  graphNumber: { type: Number, required: true },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  eventLog: [eventLogSchema],
  completedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Graph", graphSchema);
