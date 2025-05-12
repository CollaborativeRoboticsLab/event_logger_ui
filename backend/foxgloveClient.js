const { FoxgloveClient } = require("@foxglove/ws-protocol");
const WebSocket = require("ws");
const Event = require("./models/Event");
const decoders = require("./decoders");
const sanitizeEvent = require("./utils/sanitizeEvent"); // ✅ Import the sanitizer

let activeClients = new Map();
let broadcastFn = null;

function setBroadcast(fn) {
  broadcastFn = fn;
}

function startFoxgloveClient(sessionId) {
  if (activeClients.has(sessionId.toString())) {
    console.log(`[FoxgloveClient] Session ${sessionId} already listening`);
    return;
  }

  console.log(`[FoxgloveClient] Starting client for session: ${sessionId}`);

  const tryConnect = () => {
    console.log("[FoxgloveClient] Attempting to connect to ws://0.0.0.0:8765...");

    const client = new FoxgloveClient({
      ws: new WebSocket("ws://0.0.0.0:8765", [FoxgloveClient.SUPPORTED_SUBPROTOCOL]),
    });

    const deserializers = new Map();

    client.on("open", () => {
      console.log(`[FoxgloveClient] ✅ Connected for session: ${sessionId}`);
      activeClients.set(sessionId.toString(), client);
    });

    client.on("advertise", (channels) => {
      for (const channel of channels) {
        const decoder = decoders[channel.topic];
        if (!decoder) {
          console.warn(`[FoxgloveClient] ⚠️ No decoder for topic ${channel.topic}`);
          continue;
        }

        if (channel.encoding !== "cdr") {
          console.warn(`[FoxgloveClient] ⚠️ Unsupported encoding for topic ${channel.topic}: ${channel.encoding}`);
          continue;
        }

        const subId = client.subscribe(channel.id);
        deserializers.set(subId, decoder);
        console.log(`📡 Subscribed to: ${channel.topic}`);
      }
    });

    client.on("message", ({ subscriptionId, data }) => {
      const decode = deserializers.get(subscriptionId);
      if (!decode) return;

      const decoded = decode(data);
      const event = new Event({ ...decoded, session: sessionId });

      event
        .save()
        .then((saved) => {
          const sanitized = sanitizeEvent(saved); // ✅ Remove _id, timestamps, etc.
          if (broadcastFn) {
            broadcastFn(sanitized);
          }
        })
        .catch((err) => console.error("[FoxgloveClient] ❌ Failed to save event:", err.message));
    });

    client.on("error", (err) => {
      console.error(`[FoxgloveClient] ❌ WebSocket error: ${err.message}`);
    });

    client.on("close", () => {
      console.warn(`[FoxgloveClient] 🔌 Connection closed for session: ${sessionId}`);
      activeClients.delete(sessionId.toString());
      setTimeout(tryConnect, 3000);
    });
  };

  tryConnect();
}

module.exports = { startFoxgloveClient, setBroadcast };
