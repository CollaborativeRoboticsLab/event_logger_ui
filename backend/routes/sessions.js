// backend/routes/sessions.js
const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const { startFoxgloveClient } = require("../foxgloveClient");

// GET all sessions (latest first)
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).limit(50);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new session and optionally start listening
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    const lastSession = await Session.findOne().sort({ serial: -1 });
    const nextSerial = lastSession ? lastSession.serial + 1 : 0;

    const newSession = new Session({
      serial: nextSerial,
      name,
    });

    const saved = await newSession.save();
    console.log("[Session API] Created new session:", saved);

    if (req.query.listen === "true") {
      console.log("[Session API] Triggering FoxgloveClient for session:", saved._id);
      startFoxgloveClient(saved._id);
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error("[Session API] Error creating session:", err.message);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
