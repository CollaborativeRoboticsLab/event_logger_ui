// backend/foxgloveClient.js
const { FoxgloveClient } = require("@foxglove/ws-protocol");
const WebSocket = require("ws");
const Event = require("./models/Event");
const decoders = require("./decoders");

function startFoxgloveClient(sessionId) {
  console.log("[FoxgloveClient] Starting client for session:", sessionId);
  const client = new FoxgloveClient({
    ws: new WebSocket("ws://0.0.0.0:8765", [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
  });

  const deserializers = new Map();

  client.on("advertise", (channels) => {
    console.log("[FoxgloveClient] Channels advertised:", channels.map(c => c.topic));
    for (const channel of channels) {
      if (channel.topic !== "/capabilities2/events" || channel.encoding !== "cdr") {
        console.log(`[FoxgloveClient] Skipping channel: ${channel.topic} (${channel.encoding})`);
        continue;
      }
      console.log(`[FoxgloveClient] Subscribing to channel: ${channel.topic}`);
      const subId = client.subscribe(channel.id);
      const decoder = decoders[channel.topic];
      if (!decoder) {
        console.warn(`[FoxgloveClient] No decoder found for topic: ${channel.topic}`);
        continue;
      }
      deserializers.set(subId, decoder);
    }
  });

  client.on("message", ({ subscriptionId, data }) => {
    const decode = deserializers.get(subscriptionId);
    if (!decode) {
      console.warn("[FoxgloveClient] No decoder for subscription:", subscriptionId);
      return;
    }
    const msg = decode(data);
    console.log("[FoxgloveClient] Event received:", msg);
    const event = new Event({ ...msg, session: sessionId });
    event.save()
      .then(() => console.log("[FoxgloveClient] Event saved to DB."))
      .catch((err) => console.error("[FoxgloveClient] Failed to save event:", err.message));
  });

  console.log("[FoxgloveClient] initialized for session:", sessionId);
}

module.exports = { startFoxgloveClient };
