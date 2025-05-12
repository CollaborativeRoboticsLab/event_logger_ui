
function sanitizeEvent(event) {
  return {
    session: event.session?.toString(),
    header: event.header,
    origin_node: event.origin_node,
    source: event.source,
    target: event.target,
    thread_id: event.thread_id,
    event: event.event,
    type: event.type,
    content: event.content,
    pid: event.pid,
    _id: event._id?.toString(), // ✅ include _id if saved
  };
}

module.exports = sanitizeEvent;