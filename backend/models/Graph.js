const mongoose = require("mongoose");

const nodeSchema = new mongoose.Schema({
  nodeId: { type: Number, required: true},
  capability: String,
  provider: String,
}, { _id: false });

const edgeSchema = new mongoose.Schema({
  edgeId: { type: Number, required: true},
  sourceNodeID: { type: Number, required: true }, // Node ID of the source node
  targetNodeID: { type: Number, required: true }, // Node ID of the target node
}, { _id: false });

const eventLogSchema = new mongoose.Schema({
  eventId: { type: Number, required: true},
  nodeId: { type: Number, default: null }, // Optional, can be null if not related to a node
  edgeId: { type: Number, default: null }, // Optional, can be null if not related to an edge
  nodeState: {
    type: String,
    enum: ["idle", "executing", "complete", "failed"],
    default: "idle",
  },
  edgeState: { type: Boolean, default: false }, // Indicates if the edge is activated
}, { _id: false });

const graphSchema = new mongoose.Schema({
  graphId: { type: String, required: true, unique: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  graphNo: { type: Number, required: true },
  nodes: [nodeSchema],
  edges: [edgeSchema],
  eventLog: [eventLogSchema],
  completed: { type: Boolean, default: false },
  completedAt: Date,
}, { timestamps: true });

graphSchema.index({ session: 1, graphNo: 1 }, { unique: true });

module.exports = mongoose.model("Graph", graphSchema);
