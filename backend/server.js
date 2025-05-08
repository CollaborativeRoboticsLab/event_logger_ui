const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const { startFoxgloveClient } = require("./foxgloveClient");
const eventRoutes = require("./routes/events");
const Event = require("./models/Event");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/events", eventRoutes);

// HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Broadcast to connected clients
function broadcast(data) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");

    // Start backend server (HTTP + WS)
    server.listen(5000, () => console.log("🚀 Server running on port 5000"));

    // Start Foxglove WebSocket client
    startFoxgloveClient((event) => {
      // Optional: broadcast to frontend
      broadcast(event);
    });
  })
  .catch((err) => console.error("❌ DB error:", err));