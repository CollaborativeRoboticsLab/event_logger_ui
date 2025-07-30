const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// Get filtered events
router.get('/', async (req, res) => {
  try {
    const filter = {};

    if (req.query.session) {
      filter.session = req.query.session;
    }

    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });  }
});

module.exports = router;