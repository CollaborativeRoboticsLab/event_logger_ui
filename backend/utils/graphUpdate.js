const Graph = require("../models/Graph");

function makeKey({ capability, provider }) {
  return `${capability}:${provider}`;
}

async function updateGraphWithRunnerEvent(event, sessionId) {
  const sessionKey = sessionId.toString();
  const graph = require("../foxgloveClient").activeGraphs.get(sessionKey);

  if (!graph) {
    console.warn(`[GraphUpdater] No active graph in memory for session ${sessionKey}`);
    return;
  }

  const sourceKey = makeKey(event.source);
  const targetKey = makeKey(event.target);

  let edgeMatched = false;

  for (const edge of graph.edges) {
    const fromKey = makeKey(edge.from);
    const toKey = makeKey(edge.to);

    if (fromKey === sourceKey && toKey === targetKey) {
      edge.activated = (edge.activated || 0) + 1;
      edgeMatched = true;

      for (const node of graph.nodes) {
        const nodeKey = makeKey(node);
        if (nodeKey === sourceKey) node.state = "complete";
        if (nodeKey === targetKey) node.state = "executing";
      }

      break;
    }
  }

  if (!edgeMatched) {
    for (const node of graph.nodes) {
      if (makeKey(node) === sourceKey) node.state = "failed";
    }
  }

  graph.eventLog.push({
    timestamp: new Date(),
    source: event.source,
    target: event.target,
    action: edgeMatched ? "activate" : "fail",
    edgeFound: edgeMatched,
  });

  await graph.save();
}
module.exports = updateGraphWithRunnerEvent;
