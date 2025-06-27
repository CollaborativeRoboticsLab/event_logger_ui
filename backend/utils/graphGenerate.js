function generateGraph(events) {
  const nodeSet = new Set();
  const edges = [];
  const nodes = [];
  const events = [];
  let nodeId = 0;
  let edgeId = 0;
  let eventId = 0;

  for (const event of events) {
    if (event.type !== "RUNNER_DEFINE") continue;

    let sourceNodeID = 0;
    let targetNodeID = 0;

    const sourceCapability = event.source.capability;
    const sourceProvider = event.source.provider;
    const targetCapability = event.target.capability;
    const targetProvider = event.target.provider;

    if (!sourceCapability || !sourceProvider) continue;
    if (!targetCapability || !targetProvider) continue; // skip if target is empty

    const srcKey = `${sourceCapability}:${sourceProvider}`;
    const tgtKey = `${targetCapability}:${targetProvider}`;

    // Check if source is a unique node
    if (!nodeSet.has(srcKey)) {
      nodeSet.add(srcKey);
      nodes.push({ nodeId, sourceCapability, sourceProvider });
      events.push({ eventId, nodeId, edgeId: null, nodeState: "idle", edgeState: false });
      sourceNodeID = nodeId; // Store the node ID for the source
      eventId++;
      nodeId++;
    } else {
      sourceNodeID = nodes.find((n) => n.capability === sourceCapability && n.provider === sourceProvider)?.nodeId;
    }

    // Check if target is a unique node
    if (!nodeSet.has(tgtKey)) {
      nodeSet.add(tgtKey);
      nodes.push({ nodeId, targetCapability, targetProvider });
      events.push({ eventId, nodeId, edgeId: null, nodeState: "idle", edgeState: false });
      targetNodeID = nodeId; // Store the node ID for the target
      eventId++;
      nodeId++;
    }
    else {
      targetNodeID = nodes.find((n) => n.capability === targetCapability && n.provider === targetProvider)?.nodeId;
    }

    // Create an edge from source to target
    edges.push({
      edgeId,
      sourceNodeID,
      targetNodeID,
      activated: false,
    });

    // Log the edge event
    events.push({
      eventId: eventId,
      nodeId: null, // No specific node for edges
      edgeId: edgeId,
      nodeState: null, // Not applicable for edges
      edgeState: false,
    });

    edgeId++;
    eventId++;
  }


  return { nodes, edges, events };
}

module.exports = generateGraph;
