const express = require("express");
const http = require("http");
const cors = require("cors");
const mongoose = require("mongoose");
const WebSocket = require("ws");

const sessionRoutes = require("./routes/sessions");
const eventRoutes = require("./routes/events");
const graphRoutes = require("./routes/graphs");

const { setBroadcast } = require("./foxgloveClient");
const sanitizeEvent = require("./utils/sanitizeEvent"); // ✅ import

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

app.use("/api/sessions", sessionRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/graphs", graphRoutes);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/event_logger", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", () => {
  console.log("[Backend] ✅ MongoDB connected");
});

// ✅ Use the sanitize module
setBroadcast((event) => {
  // console.log("📡 [Backend] Received event to broadcast:", event);
  const sanitized = sanitizeEvent(event);
  const payload = JSON.stringify(sanitized);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Backend] 🚀 Server running on port ${PORT}`);
});
