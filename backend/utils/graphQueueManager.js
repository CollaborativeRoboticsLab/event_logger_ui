const { createGraphForSession, finalizeGraphForSession, activeGraphs, } = require("./graphManage");
const updateGraphWithRunnerEvent = require("./graphUpdate");

const runnerQueues = new Map(); // sessionId => { define: [], event: [] }
let broadcastGraphFn = null;

function setGraphBroadcast(fn) {
	broadcastGraphFn = fn;
}

function getActiveGraphForSession(sessionId) {
	const graph = activeGraphs.get(sessionId.toString());
	return graph || null;
}

function initQueuesForSession(sessionId) {
	const key = sessionId.toString();
	if (!runnerQueues.has(key)) {
		runnerQueues.set(key, { define: [], event: [], processing: false });
	}
}

function addToQueue(event, sessionId) {
	const key = sessionId.toString();
	initQueuesForSession(sessionId);

	if (!event || typeof event.type !== "string") return;

	const queues = runnerQueues.get(key);
	if (event.type === "RUNNER_DEFINE") {
		queues.define.push(event);
	} else if (event.type === "RUNNER_EVENT") {
		queues.event.push(event);
	}

	processQueues(key);
}

async function processQueues(sessionKey) {
	const queues = runnerQueues.get(sessionKey);
	if (!queues || queues.processing) return;

	queues.processing = true;

	try {
		if (queues.define.length && queues.event.length === 1) {
			await finalizeGraphForSession(sessionKey);
			const graph = await createGraphForSession(sessionKey);
			if (broadcastGraphFn && graph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph });
			}
		}

		while (queues.event.length > 0) {
			const evt = queues.event.shift();
			await updateGraphWithRunnerEvent(evt, sessionKey);

			// Publish updated graph after runner event
			const currentGraph = getActiveGraphForSession(sessionKey);
			if (broadcastGraphFn && currentGraph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph: currentGraph });
			}
		}
	} catch (err) {
		console.error(`[QueueProcessor] ❌ Error: ${err.message}`);
	} finally {
		queues.processing = false;
	}
}

module.exports = {
	addToQueue,
	initQueuesForSession,
	getActiveGraphForSession,
	setGraphBroadcast,
	resetSessionQueues, // optional
};