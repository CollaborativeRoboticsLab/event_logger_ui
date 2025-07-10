const {
	createGraphForSession,
	finalizeGraphForSession,
	updateGraphWithRunnerEvent,
	updateGraphNumbers,
	getActiveGraphKey, } = require("./graphManage")

const sessionQueues = new Map(); // sessionId => { define: [], event: [] }
let broadcastGraphFn = null;


/** Sets the function to broadcast graph updates.
 * @param {Function} fn - The function to call when broadcasting graph updates.
 * This function is used to set a callback that will be invoked
 * whenever the graph is updated, allowing for real-time updates to be sent
 * to clients or other parts of the application.
 */
function setGraphBroadcast(fn) {
	broadcastGraphFn = fn;
}

async function process(event, sessionId) {
	if (!sessionId) {
		console.warn("[QueueProcessor] No session ID provided, cannot process event.");
		return;
	}

	if (!sessionQueues.has(sessionId)) {
		sessionQueues.set(sessionId, {
			queue: [],
			process_state: "IDLE" // IDLE, DEFINE, EVENT
		});
	}

	const queues = sessionQueues.get(sessionId);

	if (event.type === "RUNNER_DEFINE") {
		queues.define.push(event);
	} else if (event.type === "RUNNER_EVENT") {
		queues.event.push(event);
	}

	await processQueues(sessionId);
}

async function addToQueue(event, sessionId) {
	const keyTest = getActiveGraphKey(sessionId);

	if (!keyTest) {
		console.warn(`[QueueProcessor] No active graph key for session ${sessionId} so creating a new one.`);
		await updateGraphNumbers(sessionId);
	}

	const key = getActiveGraphKey(sessionId);

	if (!runnerQueues.has(key)) {
		runnerQueues.set(key, {
			define: [],
			event: [],
			processing: false
		});
	}

	if (!event || typeof event.type !== "string") return;

	const queues = runnerQueues.get(key);

	if (event.type === "RUNNER_DEFINE") {
		queues.define.push(event);
	} else if (event.type === "RUNNER_EVENT") {
		queues.event.push(event);
	}

	await processQueues(sessionId);
}

async function processQueues(sessionId) {
	const key = getActiveGraphKey(sessionId);

	const queues = runnerQueues.get(key);
	if (!queues || queues.processing) return;

	queues.processing = true;

	try {
		if (queues.define.length > 0 && queues.event.length === 1) {
			const newGraph = await createGraphForSession(sessionId, queues.define);

			if (broadcastGraphFn && newGraph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph: newGraph });
			}

			queues.define = [];
		}

		while (queues.event.length > 0) {
			const evt = queues.event.shift();

			const updatedGraph = await updateGraphWithRunnerEvent(sessionId, evt);

			if (broadcastGraphFn && updatedGraph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph: updatedGraph });
			}
		}

		if (queues.define.length === 1 && queues.event.length === 0) {
			await finalizeGraphForSession(sessionId);

			const newKey = getActiveGraphKey(sessionId);

			runnerQueues.set(newKey, {
				define: [],
				event: [],
				processing: false
			});

			const newQueues = runnerQueues.get(newKey);

			newQueues.define = queues.define.slice(0, 1);
		}
	} catch (err) {
		console.error(`[QueueProcessor] ❌ Error: ${err.message}`);
	} finally {
		queues.processing = false;
	}
}

module.exports = {
	process,
	setGraphBroadcast,
};