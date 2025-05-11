
function sanitizeEvent(event) {
    return {
      header: event.header,
      origin_node: event.origin_node,
      source: event.source,
      target: event.target,
      thread_id: event.thread_id,
      event: event.event,
      type: event.type,
      content: event.content,
      pid: event.pid,
    };
  }
  
  module.exports = sanitizeEvent;