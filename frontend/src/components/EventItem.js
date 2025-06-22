import React from "react";
import "./EventItem.css";

function typeToLabel(type) {
    return type;
}

function getEventIcon(type) {
    switch (type) {
        case "ERROR":
            return "❌  ";
        case "ERROR_ELEMENT":
            return "❌  ";
        case "DEBUG":
            return "🛠️  ";
        case "INFO":
            return "ℹ️  ";
        case "RUNNER_DEFINE":
            return "🔧  ";
        case "RUNNER_EVENT":
            return "🔄  ";
        default:
            return "ℹ️  ";
    }
}

function generateEventSummary(msg) {
    const origin = msg.origin_node || "";
    const source = msg.source?.capability || "";
    const target = msg.target?.capability || "";
    const threadId = msg.thread_id;
    const content = msg.content || "";
    const event = msg.event;

    if (msg.type === "ERROR_ELEMENT") {
        return `[${origin}][${source}/${threadId}] ${content}`;
    }

    if (msg.type === "RUNNER_DEFINE" && event === "STARTED") {
        return `[${origin}][${source}] will trigger [${target}] on start`;
    }

    if (msg.type === "RUNNER_DEFINE" && event === "STOPPED") {
        return `[${origin}][${source}] will trigger [${target}] on stop`;
    }

    if (msg.type === "RUNNER_DEFINE" && event === "FAILED") {
        return `[${origin}][${source}] will trigger [${target}] on failure`;
    }

    if (msg.type === "RUNNER_DEFINE" && event === "SUCCEEDED") {
        return `[${origin}][${source}] will trigger [${target}] on success`;
    }

    if (threadId >= 0 && msg.type === "RUNNER_EVENT" && event === "STARTED") {
        return `[${origin}][${source}][${threadId}] triggering [${target}] on start`;
    }

    if (threadId < 0 && msg.type === "RUNNER_EVENT" && event === "STARTED") {
        return `[${origin}][${source}] triggering [${target}] on start`;
    }

    if (threadId >= 0 && msg.type === "RUNNER_EVENT" && event === "STOPPED") {
        return `[${origin}][${source}][${threadId}] triggering [${target}] on stop`;
    }

    if (threadId < 0 && msg.type === "RUNNER_EVENT" && event === "STOPPED") {
        return `[${origin}][${source}] triggering [${target}] on stop`;
    }

    if (threadId >= 0 && msg.type === "RUNNER_EVENT" && event === "FAILED") {
        return `[${origin}][${source}][${threadId}] triggering [${target}] on failure`;
    }

    if (threadId < 0 && msg.type === "RUNNER_EVENT" && event === "FAILED") {
        return `[${origin}][${source}] triggering [${target}] on failure`;
    }

    if (threadId >= 0 && msg.type === "RUNNER_EVENT" && event === "SUCCEEDED") {
        return `[${origin}][${source}][${threadId}] triggering [${target}] on success`;
    }

    if (threadId < 0 && msg.type === "RUNNER_EVENT" && event === "SUCCEEDED") {
        return `[${origin}][${source}] triggering [${target}] on success`;
    }

    if (threadId >= 0 && !target && !source) {
        return `[${origin}][${threadId}] ${content}`;
    }

    if (threadId < 0 && !target && !source) {
        return `[${origin}] ${content}`;
    }

    if (threadId >= 0 && !target && source) {
        return `[${origin}][${source}/${threadId}] ${content}`;
    }

    if (threadId < 0 && !target && source) {
        return `[${origin}][${source}] ${content}`;
    }

    return `[${origin}] ${content}`;
}

function EventItem({ event, isExpanded, onClick }) {
    return (
        <div className="event-item" onClick={() => onClick(event._id)}>
            <div className={`event-summary ${event.type.toLowerCase()}`}>
                <span className="event-icon">{getEventIcon(event.type)}</span>
                <strong>[{typeToLabel(event.type)}]</strong> {generateEventSummary(event)}
            </div>

            {isExpanded && (
                <div className="event-details">
                    <table className="event-details-table">
                        <tbody>
                            <tr>
                                <td><strong>Header</strong></td>
                                <td>sec</td>
                                <td>{event.header?.stamp?.sec ?? ""}</td>
                                <td>nanosec</td>
                                <td>{event.header?.stamp?.nanosec ?? ""}</td>
                                <td>frame_id</td>
                                <td>{event.header?.frame_id ?? ""}</td>
                            </tr>
                            <tr>
                                <td><strong>Source</strong></td>
                                <td>capability</td>
                                <td>{event.source?.capability ?? ""}</td>
                                <td>provider</td>
                                <td>{event.source?.provider ?? ""}</td>
                                <td>parameters</td>
                                <td>{event.source?.parameters ?? ""}</td>
                            </tr>
                            <tr>
                                <td><strong>Target</strong></td>
                                <td>capability</td>
                                <td>{event.target?.capability ?? ""}</td>
                                <td>provider</td>
                                <td>{event.target?.provider ?? ""}</td>
                                <td>parameters</td>
                                <td>{event.target?.parameters ?? ""}</td>
                            </tr>
                            <tr>
                                <td><strong>Meta</strong></td>
                                <td>origin node</td>
                                <td>{event.origin_node ?? ""}</td>
                                <td>thread_id</td>
                                <td>{event.thread_id ?? ""}</td>
                                <td>pid</td>
                                <td>{event.pid ?? ""}</td>
                            </tr>
                            <tr>
                                <td><strong>message</strong></td>
                                <td>type</td>
                                <td>{event.type ?? ""}</td>
                                <td>event</td>
                                <td>{event.event ?? ""}</td>
                                <td colSpan="2"></td>
                            </tr>
                            <tr>
                                <td><strong>content</strong></td>
                                <td colSpan="6">{event.content ?? ""}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            )}
        </div>
    );
}

export default EventItem;
