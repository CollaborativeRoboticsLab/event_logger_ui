const {
	createGraphForSession,
	finalizeGraphForSession,
	updateGraphWithRunnerEvent,} = require("./graphManage")

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
	// Validate the sessionId and event.
	if (!sessionId) {
		console.warn("[QueueProcessor] No session ID provided, cannot process event.");
		return;
	}

	// Initialize the session queue if it doesn't exist.
	if (!sessionQueues.has(sessionId)) {
		sessionQueues.set(sessionId, {
			queue: [],
			define: [],
			processing: false,
			process_state: "IDLE" // IDLE, DEFINE, EVENT
		});
	}

	// Check if the event is valid.
	if (!event || typeof event.type !== "string") return;

	// Retrieve the queue for the given session ID.
	const queue = sessionQueues.get(sessionId);

	// Push the event into the queue based on if it is a RUNNER_DEFINE or RUNNER_EVENT.
	if (event.type === "RUNNER_DEFINE" || event.type === "RUNNER_EVENT") {
		queue.queue.push(event);
	}

	await processQueues(sessionId);
}

async function processQueues(sessionId) {
	// Retrieve the queues for the given session ID.
	const queue = sessionQueues.get(sessionId);

	// If the queue is already processing, return early to avoid re-entrancy issues.
	if (!queue || queue.processing) return;

	// Set the queue to processing state.
	queue.processing = true;

	const eventsToProcess = [...queue.queue]; // clone current queue
	queue.queue.length = 0; 				  // clear early to avoid mid-loop appends

	for (const element of eventsToProcess) {
		try {
			if (queue.process_state === "IDLE" && element.type === "RUNNER_DEFINE") {
				queue.process_state = "DEFINE";
				console.info(`[QueueProcessor] Starting DEFINE state for session ${sessionId}`);

				// If we are coming from IDLE state and get RUNNER_DEFINE, push the event into define queue
				queue.define.push(element);

			} else if (queue.process_state === "DEFINE" && element.type === "RUNNER_DEFINE") {
				queue.process_state = "DEFINE";
				console.info(`[QueueProcessor] Continuing DEFINE state for session ${sessionId}`);

				// If we are in DEFINE and still getting RUNNER_DEFINE, push the event into define queue
				queue.define.push(element);

			} else if (queue.process_state === "DEFINE" && element.type === "RUNNER_EVENT") {
				queue.process_state = "EVENT";
				console.info(`[QueueProcessor] Transitioning to EVENT state for session ${sessionId}`);

				// If we are in DEFINE state and RUNNER_EVENT are starting, create the graph with define queue
				const newGraph = await createGraphForSession(sessionId, queue.define);

				if (broadcastGraphFn && newGraph) {
					broadcastGraphFn({ type: "GRAPH_UPDATE", graph: newGraph });
				}

				// Empty the define queue after creating the graph
				queue.define.length = 0;

				// update the graph with event
				const updatedGraph = await updateGraphWithRunnerEvent(sessionId, element);

				if (broadcastGraphFn && updatedGraph) {
					broadcastGraphFn({ type: "GRAPH_UPDATE", graph: updatedGraph });
				}

			} else if (queue.process_state === "EVENT" && element.type === "RUNNER_EVENT") {
				queue.process_state = "EVENT";
				console.info(`[QueueProcessor] Continuing EVENT state for session ${sessionId}`);

				// If we are in EVENT state and getting RUNNER_EVENT, update the graph with the event				// update the graph with event
				const updatedGraph = await updateGraphWithRunnerEvent(sessionId, element);

				if (broadcastGraphFn && updatedGraph) {
					broadcastGraphFn({ type: "GRAPH_UPDATE", graph: updatedGraph });
				}

			} else if (queue.process_state === "EVENT" && element.type === "RUNNER_DEFINE") {
				queue.process_state = "DEFINE";
				console.info(`[QueueProcessor] Transitioning to DEFINE state from EVENT for session ${sessionId}`);

				// If we are in EVENT state and getting RUNNER_DEFINE, finalize the graph for the session
				await finalizeGraphForSession(sessionId);
				
				// Add the RUNNER_DEFINE to the define queue
				queue.define.push(element);
			}
		} catch (err) {
			console.error(`[QueueProcessor] ❌ Error processing element: ${err.message}`);
			queue.processing = false;
			return;
		}
	}

	queue.processing = false;
}

module.exports = {
	process,
	setGraphBroadcast,
};