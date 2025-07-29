const express = require("express");
const router = express.Router();
const Graph = require("../models/Graph");
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

router.get("/:sessionId", async (req, res) => {
  try {
    const graphs = await Graph.find({ session: req.params.sessionId }).sort({ graphNo: 1 });
    res.json(graphs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:sessionId/count", async (req, res) => {
  try {
    const count = await Graph.countDocuments({ session: req.params.sessionId });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:sessionId/:index", async (req, res) => {
  const { sessionId, index } = req.params;
  try {
    const graph = await Graph.find({ session: sessionId })
      .sort({ graphNo: 1 })
      .skip(Number(index))
      .limit(1);

    if (!graph || graph.length === 0) return res.status(404).json({ message: "Graph not found" });

    res.json(graph[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
