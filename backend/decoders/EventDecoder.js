const { CdrReader } = require("@foxglove/cdr");

// Enum lookup maps
const EVENT_ENUM_MAP = {
  0: "IDLE",
  1: "STARTED",
  2: "STOPPED",
  3: "FAILED",
  4: "SUCCEEDED",
  5: "UNDEFINED",
};

const TYPE_ENUM_MAP = {
  0: "INFO",
  1: "DEBUG",
  2: "ERROR",
  3: "ERROR_ELEMENT",
  4: "RUNNER_DEFINE",
  5: "RUNNER_EVENT",
};

function decodeEvent(data) {
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

    const eventNum = reader.uint8();
    const typeNum = reader.uint8();

    const content = reader.string();
    const pid = reader.int32();

    return {
      header,
      origin_node,
      source,
      target,
      thread_id,
      event: EVENT_ENUM_MAP[eventNum] || "UNDEFINED",
      type: TYPE_ENUM_MAP[typeNum] || "INFO",
      content,
      pid,
    };
  } catch (err) {
    console.error("⚠️ Decode error:", err.message);
    return {};
  }
}

module.exports = decodeEvent;
