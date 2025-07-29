const express = require("express");
const router = express.Router();
const Graph = require("../models/Graph");
const { createGraphForSession } = require("../utils/graphManage");

router.post("/:sessionId/create", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const graph = await createGraphForSession(sessionId);
    if (!graph) return res.status(404).json({ message: "No RUNNER_DEFINE events found" });
    console.info("Graph creation sucess",sessionId);
    res.json(graph);
  } catch (err) {
    console.error("Graph creation failed", err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const graphs = await Graph.find({ session: sessionId }).sort({ graphNo: 1 });
    console.info("All graph count ",graphs.length);
    res.json(graphs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:sessionId/count", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const count = await Graph.countDocuments({ session: sessionId });
    console.info("Graph count for session", sessionId, "is", count);
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
