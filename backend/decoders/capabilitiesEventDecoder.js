const { CdrReader } = require("@foxglove/cdr");

/**
 * Decode /capabilities2/events (CDR format)
 */
function decodeCapabilityEvent(data) {
  const reader = new CdrReader(data);

  try {
    const header = {
      stamp: {
        sec: reader.uint32(),
        nanosec: reader.uint32(),
      },
      frame_id: reader.string(),
    };

    const origin_node = reader.string();

    const source = {
      capability: reader.string(),
      provider: reader.string(),
      parameters: reader.string(),
    };

    const target = {
      capability: reader.string(),
      provider: reader.string(),
      parameters: reader.string(),
    };

    const thread_id = reader.int8();
    const event = reader.uint8();
    const type = reader.uint8();
    const content = reader.string();
    const pid = reader.int32();

    return {
      header,
      origin_node,
      source,
      target,
      thread_id,
      event,
      type,
      content,
      pid,
    };
  } catch (err) {
    console.error("⚠️ Failed to decode CapabilityEvent:", err.message);
    return {};
  }
}

module.exports = decodeCapabilityEvent;
