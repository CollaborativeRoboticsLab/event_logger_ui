const Graph = require("../models/Graph");
const Event = require("../models/Event");

const activeGraphs = new Map(); // still exportable
const graphNumbers = new Map(); // sessionId => graphId

/** Sets the active graph number for a given session ID.
 * @param {string} sessionId - The ID of the session for which to set the active graph key.
 * @param {number} graphNo - The graph number to set as active for the session.
 * This function updates the activeGraphKeys map to associate the session ID with the specified graph number.
 */
async function updateGraphNumbers(sessionId) {
  const graphCount = await Graph.countDocuments({ session: sessionId });
  graphNumbers.set(sessionId, graphCount + 1);

  console.log(`[GraphManager] Updated graph number for session ${sessionId}: ${getGraphNumbers(sessionId)}`);
}

function getGraphNumbers(sessionId) {
  return graphNumbers.get(sessionId) || null;
}

/** Generates a unique key for the active graph based on session ID and graph number.
 * 
 * @param {string} sessionId - The ID of the session for which to get the active graph key.
 * @returns {string} A unique key for the active graph.
 * 
 * This key is used to store and retrieve the active graph in the activeGraphs map.
 */
function getActiveGraphKey(sessionId) {
  const activeGraphNo = getGraphNumbers(sessionId);

  if (activeGraphNo === null) {
    console.warn(`[GraphManager] No active graph number for session ${sessionId}`);
    return null;
  }
  else {
    return `${sessionId.toString()}-${activeGraphNo}`;
  }

}

/** Retrieves the active graph for a given session ID.
 * 
 * @param {string} sessionId - The ID of the session for which to retrieve the active graph.
 * @returns {Graph|null} The active graph for the session, or null if no active graph exists.
 * 
 * This function checks the activeGraphs map for a graph associated with the session ID.
 * If no graph is found, it returns null.
 */
function getActiveGraph(sessionId) {
  const key = getActiveGraphKey(sessionId);
  if (!key) {
    console.warn(`[GraphManager] No active graph key for session ${sessionId}`);
    return null;
  }
  else {
    const graph = activeGraphs.get(key);
    return graph || null;
  }
}

/** Sets the active graph for a given session ID. 
 * This function updates the activeGraphs map to associate the session ID with the specified graph.
 * 
 * @param {string} sessionId - The ID of the session for which to set the active graph.
 * @param {Graph} graph - The graph to set as active for the session.
 * @returns {void}
 * 
 * This function retrieves the active graph key for the session and sets the graph in the activeGraphs map.
 * If no active graph key is found, it logs a warning.
 */
function setActiveGraph(sessionId, graph) {
  const key = getActiveGraphKey(sessionId);
  if (!key) {
    console.warn(`[GraphManager] No active graph key for session ${sessionId}`);
    return;
  }
  activeGraphs.set(key, graph);
}

/** Generates a graph structure from a list of events. This function processes the events of 
 * type "RUNNER_DEFINE" to create nodes and edges. It initializes nodes for unique capabilities 
 * and providers, creates edges between source and target nodes, and logs events.
 * 
 * @param {Array} eventsList - An array of event objects to generate the graph from.
 * @returns {Object} An object containing nodes, edges, and event logs.
 * 
 * The nodes are unique based on capability and provider, edges connect source and target nodes, 
 * and events log the state of nodes and edges.
 */
function generateGraph(eventsList) {
  const nodeSet = new Set();
  const edges = [];
  const nodes = [];
  const eventLog = [];
  let nodeId = 0;
  let edgeId = 0;
  let eventId = 0;

  for (const event of eventsList) {
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
    if (nodeSet.has(srcKey)) {
      sourceNodeID = nodes.find((n) =>
        n.capability === sourceCapability &&
        n.provider === sourceProvider)?.nodeId;
    } else {
      nodeSet.add(srcKey);
      nodes.push({
        nodeId: nodeId,
        capability: sourceCapability,
        provider: sourceProvider
      });
      eventLog.push({
        eventId: eventId,
        nodeId: nodeId,
        edgeId: null,
        nodeState: "idle",
        edgeState: false
      });
      sourceNodeID = nodeId; // Store the node ID for the source
      eventId++;
      nodeId++;
    }

    // Check if target is a unique node
    if (nodeSet.has(tgtKey)) {
      targetNodeID = nodes.find((n) =>
        n.capability === targetCapability &&
        n.provider === targetProvider)?.nodeId;

      // Create an edge from source to target
      edges.push({
        edgeId: edgeId,
        sourceNodeID: sourceNodeID,
        targetNodeID: targetNodeID,
      });

      // Log the edge event
      eventLog.push({
        eventId: eventId,
        nodeId: null, // No specific node for edges
        edgeId: edgeId,
        nodeState: null, // Not applicable for edges
        edgeState: false,
      });
      edgeId++;
      eventId++;

    } else {
      nodeSet.add(tgtKey);
      nodes.push({
        nodeId: nodeId,
        capability: targetCapability,
        provider: targetProvider
      });

      targetNodeID = nodeId; // Store the node ID for the target
      // Create an edge from source to target
      edges.push({
        edgeId: edgeId,
        sourceNodeID: sourceNodeID,
        targetNodeID: targetNodeID,
      });
      eventLog.push({
        eventId: eventId,
        nodeId: targetNodeID,
        edgeId: edgeId,
        nodeState: "idle",
        edgeState: false
      });
      eventId++;
      nodeId++;
      edgeId++;
    }
  }

  return { nodes, edges, eventLog };
}

/** Creates a graph for a given session.
 * This function generates a graph based on the events of type "RUNNER_DEFINE"
 * associated with the session ID. It initializes nodes and edges based on
 * the events and saves the graph to the database.
 * 
 * @param {string} sessionId - The ID of the session for which to create the graph.
 * @returns {Promise<Graph|null>} - A promise that resolves to the created graph or null if no events are found.
 * 
 * This function retrieves all "RUNNER_DEFINE" events for the specified session,
 * generates nodes and edges, and creates a new Graph document in the database.
 * If no events are found, it returns null.
 */
async function createGraphForSession(sessionId, events) {
  if (!events.length) return null;

  const { nodes, edges, eventLog } = generateGraph(events);

  const graphKey = getActiveGraphKey(sessionId);
  const graphNumber = getGraphNumbers(sessionId);

  console.log("Graph data for graph:", graphKey);
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);
  console.log("Initializing Events:", eventLog);

  const graph = new Graph({
    graphId: graphKey,
    session: sessionId,
    graphNo: graphNumber,
    nodes: nodes,
    edges: edges,
    eventLog: eventLog,
  });

  await graph.save();

  setActiveGraph(sessionId, graph);

  return graph;
}

/**
 * Finalizes the graph for a given session.
 * This marks the graph as completed and removes it from the active graphs map.
 * 
 * @param {string} sessionId - The ID of the session for which to finalize the graph.
  * This function should be called when the session ends or when the graph is no longer needed.
  * It updates the graph's status and removes it from the active graphs collection.
  * 
  * @returns {Promise<void>} - A promise that resolves when the graph is finalized.
 */
async function finalizeGraphForSession(sessionId) {
  const key = getActiveGraphKey(sessionId);
  const graph = getActiveGraph(sessionId);

  if (!graph) return;

  graph.completedAt = new Date();
  graph.completed = true;

  await graph.save();
  activeGraphs.delete(key);

  console.log(`[GraphFinalizer] Finalized graph ${graph.graphId}`);

  updateGraphNumbers(sessionId);
}

/** Updates the graph with a runner event.
 * This function processes a runner event and updates the graph accordingly.        
 * 
 * @param {Object} event - The runner event to process.
 * @param {string} sessionId - The ID of the session for which to update the graph.
 * @returns {Promise<Graph|null>} A promise that resolves to the updated graph or null if
 * no active graph exists for the session.
 * 
 * This function retrieves the active graph for the session,
 * checks the event type, and updates the graph's nodes, edges, and event log based on the event data.
 * It handles different event types such as "STARTED", "STOPPED", "FAILED", and "SUCCEEDED".
 * If the event data is invalid or if the source or target nodes are not found in the graph,
 * it logs a warning and returns null.
 */
async function updateGraphWithRunnerEvent(sessionId, event) {
  const graph = getActiveGraph(sessionId);

  if (!graph) {
    console.warn(`[GraphUpdater] No active graph in memory for session ${sessionId}`);
    return;
  }

  const sourceCapability = event.source.capability;
  const sourceProvider = event.source.provider;
  const targetCapability = event.target.capability;
  const targetProvider = event.target.provider;

  let sourceState = "idle";
  let targetState = "idle";
  let edgeActivated = false;

  let sourceNodeID = null;
  let targetNodeID = null;
  let edgeID = null;

  let eventId = graph.eventLog.length;

  if (event.type === "RUNNER_EVENT") {
    if (!sourceCapability || !sourceProvider || !targetCapability || !targetProvider) {
      console.warn(`[GraphUpdater] Invalid event data for session ${sessionId}:`, event);
      return;
    }

    if (graph.nodes.some(node => node.capability === sourceCapability && node.provider === sourceProvider)) {
      sourceNodeID = graph.nodes.find(node => node.capability === sourceCapability && node.provider === sourceProvider).nodeId;
    } else {
      console.warn(`[GraphUpdater] Source node not found in graph for session ${sessionId}`);
      return;
    }

    if (graph.nodes.some(node => node.capability === targetCapability && node.provider === targetProvider)) {
      targetNodeID = graph.nodes.find(node => node.capability === targetCapability && node.provider === targetProvider).nodeId;
    } else {
      console.warn(`[GraphUpdater] Target node not found in graph for session ${sessionId}`);
      return;
    }

    if (sourceNodeID !== null || targetNodeID !== null) {
      edgeID = graph.edges.find(edge => edge.sourceNodeID === sourceNodeID && edge.targetNodeID === targetNodeID)?.edgeId;
      if (edgeID === undefined) {
        console.warn(`[GraphUpdater] Edge not found in graph for session ${sessionId}:`,
          `sourceNodeID=${sourceNodeID}, targetNodeID=${targetNodeID}`);
        return;
      }
    }

    if (event.event === "STARTED") {
      // Handle STARTED event logic if needed (parallel execution)
      sourceState = "executing";
      targetState = "executing";
      edgeActivated = true;
    } else if (event.event === "STOPPED") {
      // Handle STOPPED event logic if needed (external interruption, target is response kinda recovery)
      sourceState = "failed";
      targetState = "executing";
      edgeActivated = true;
    } else if (event.event === "FAILED") {
      // Handle FAILED event logic if needed (failure usually due to an error, target is recovery)
      sourceState = "failed";
      targetState = "executing ";
      edgeActivated = true;
    } else if (event.event === "SUCCEEDED") {
      // Handle SUCCEEDED event logic if needed (target is sequential execution)
      sourceState = "complete";
      targetState = "executing";
      edgeActivated = true;
    } else {
      // Handle other events or default case
      console.warn(`[GraphUpdater] Unknown event type for session ${sessionId}:`, event.event);
      return;
    }

    graph.eventLog.push({
      eventId: eventId,
      nodeId: sourceNodeID,
      edgeId: null,
      nodeState: sourceState,
      edgeState: false
    });

    eventId++;

    graph.eventLog.push({
      eventId: eventId,
      nodeId: targetNodeID,
      edgeId: edgeID,
      nodeState: targetState,
      edgeState: edgeActivated
    });

    await graph.save();

    return graph;
  }
}

module.exports = {
  createGraphForSession,
  finalizeGraphForSession,
  updateGraphWithRunnerEvent,
  updateGraphNumbers,
  getActiveGraphKey,
};