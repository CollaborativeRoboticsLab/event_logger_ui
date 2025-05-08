const { FoxgloveClient } = require("@foxglove/ws-protocol");
const WebSocket = require("ws");
const Event = require("./models/Event");
const decoders = require("./decoders");

const deserializers = new Map();

function startFoxgloveClient(onNewEvent) {
  const client = new FoxgloveClient({
    ws: new WebSocket("ws://0.0.0.0:8765", [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });

  client.on("error", (err) => {
    console.error("❌ Foxglove WS error:", err.message);
  });

  client.on("advertise", (channels) => {
    for (const channel of channels) {
      const decoder = decoders[channel.topic];
      if (!decoder) continue; // ⛔ Skip topics without decoders

      if (channel.encoding !== "cdr") {
        console.warn(`❗ Decoder for ${channel.topic} exists, but encoding is not CDR`);
        continue;
      }

      console.log(`🎯 Subscribing to ${channel.topic} (cdr)`);

      const subId = client.subscribe(channel.id);
      deserializers.set(subId, decoder);
    }
  });

  client.on("message", ({ subscriptionId, timestamp, data }) => {
    const decode = deserializers.get(subscriptionId);
    if (!decode) return;

    const msg = decode(data);
    console.log("📩 Decoded message:", msg);

    const event = new Event(msg);
    event
      .save()
      .then((saved) => {
        console.log("✅ Event saved");
        if (onNewEvent) onNewEvent(saved);
      })
      .catch((err) => {
        console.error("❌ Save error:", err.message);
      });
  });

  console.log("🔌 Connecting to Foxglove WebSocket...");
}

module.exports = { startFoxgloveClient };
