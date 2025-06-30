const {
	createGraphForSession,
	finalizeGraphForSession,
	updateGraphWithRunnerEvent,
	getActiveGraphKey, } = require("./graphManage")

const runnerQueues = new Map(); // sessionId => { define: [], event: [] }
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

/** Adds an event to the processing queue for a specific session.
 * 
 * @param {Object} event - The event to add to the queue.
 * @param {string} sessionId - The ID of the session to which the event belongs.
 * 
 * This function categorizes the event into either 'define' or 'event' queues
 * based on the event type. It then processes the queues to ensure
 * that the graph is updated accordingly.
 * @returns {void}
 */
function addToQueue(event, sessionId) {
	const key = getActiveGraphKey(sessionId);

	if (!runnerQueues.has(key)) {
		runnerQueues.set(key, { define: [], event: [], processing: false });
	}

	if (!event || typeof event.type !== "string") return;

	const queues = runnerQueues.get(key);

	if (event.type === "RUNNER_DEFINE") {
		queues.define.push(event);
	} else if (event.type === "RUNNER_EVENT") {
		queues.event.push(event);
	}

	processQueues(sessionId);
}

/** 
 * Processes the queues for a specific session.
 * This function checks if there are events in the define or event queues 
 * and processes them accordingly.
 * 
 * @param {string} sessionId - The ID of the session to process queues for.
 * @returns {Promise<void>} - A promise that resolves when the queues are processed.
 * 
 * It finalizes the graph if there are define events and processes each event
 * in the event queue, updating the graph and broadcasting updates as necessary.
 */
async function processQueues(sessionId) {
	const graphKey = getActiveGraphKey(sessionId);
	const queues = runnerQueues.get(graphKey);
	if (!queues || queues.processing) return;

	queues.processing = true;

	try {
		if (queues.define.length && queues.event.length === 1) {
			await finalizeGraphForSession(sessionId);

			const newGraph = await createGraphForSession(sessionId);

			if (broadcastGraphFn && newGraph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph: newGraph });
			}
		}

		while (queues.event.length > 0) {
			const evt = queues.event.shift();

			const updatedGraph = await updateGraphWithRunnerEvent(evt, sessionId);

			if (broadcastGraphFn && updatedGraph) {
				broadcastGraphFn({ type: "GRAPH_UPDATE", graph: updatedGraph });
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
	setGraphBroadcast,
};