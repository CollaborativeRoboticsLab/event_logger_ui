const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  header: Object,
  origin_node: String,
  source: Object,
  target: Object,
  thread_id: Number,
  event: Number,
  type: Number,
  content: String,
  pid: Number,
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);