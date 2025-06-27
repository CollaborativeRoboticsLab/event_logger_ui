const Graph = require("../models/Graph");
const Event = require("../models/Event");
const generateGraph = require("./graphGenerate");

const activeGraphs = new Map(); // still exportable

async function createGraphForSession(sessionId) {
  const events = await Event.find({ session: sessionId, type: "RUNNER_DEFINE" });
  if (!events.length) return null;

  const graphCount = await Graph.countDocuments({ session: sessionId });
  const graphNumber = graphCount + 1;

  const { nodes, edges, eventLog } = generateGraph(events);
  const graphId = `${sessionId.toString()}-graph${graphNumber}`;

  const graph = new Graph({
    graphId,
    session: sessionId,
    graphNo: graphNumber,
    nodes,
    edges,
    eventLog,
  });

  await graph.save();
  activeGraphs.set(sessionId.toString(), graph);

  return graph;
}

async function finalizeGraphForSession(sessionId) {
  const sessionKey = sessionId.toString();
  const active = activeGraphs.get(sessionKey);
  if (!active) return;

  active.completedAt = new Date();
  active.completed = true;

  for (const node of active.nodes) {
    if (node.state === "executing") node.state = "complete";
  }

  await active.save();
  activeGraphs.delete(sessionKey);
  console.log(`[GraphFinalizer] Finalized graph ${active.graphId}`);
}

module.exports = {
  createGraphForSession,
  finalizeGraphForSession,
  activeGraphs,
};