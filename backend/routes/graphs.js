const express = require("express");
const router = express.Router();
const { createGraphForSession } = require("../utils/graphManage");

router.post("/:sessionId/create", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const graph = await createGraphForSession(sessionId);
    if (!graph) return res.status(404).json({ message: "No RUNNER_DEFINE events found" });
    res.json(graph);
  } catch (err) {
    console.error("Graph creation failed", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
