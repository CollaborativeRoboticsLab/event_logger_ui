import React, { useState, useMemo } from "react";
import "./EventList.css";

// Numeric codes: INFO=0, DEBUG=1, ERROR=2, ERROR_ELEMENT=3
const EVENT_TYPES = ["INFO", "DEBUG", "ERROR", "ERROR_ELEMENT"];

function typeToLabel(type) {
  return type; // It's already a string like "DEBUG"
}

function EventList({ events }) {
  const [selectedTypes, setSelectedTypes] = useState(EVENT_TYPES);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const originNodes = [...new Set(events.map((e) => e.origin_node).filter(Boolean))];

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const filteredEvents = useMemo(() => {
    return events.filter(
      (e) =>
        selectedTypes.includes(e.type) &&
        (!selectedOrigin || e.origin_node === selectedOrigin)
    );
  }, [events, selectedTypes, selectedOrigin]);

  function generateEventSummary(msg) {
    const origin = msg.origin_node || "";
    const source = msg.source?.capability || "";
    const target = msg.target?.capability || "";
    const threadId = msg.thread_id;
    const content = msg.content || "";

    if (msg.type === "ERROR_ELEMENT") {
      return `[${origin}][${source}/${threadId}] ${content}`;
    }

    if (threadId >= 0 && target === "" && source === "") {
      return `[${origin}][${threadId}] ${content}`;
    }

    if (threadId < 0 && target === "" && source === "") {
      return `[${origin}] ${content}`;
    }

    if (threadId >= 0 && target === "" && source !== "") {
      return `[${origin}][${source}/${threadId}] ${content}`;
    }

    if (threadId < 0 && target === "" && source !== "") {
      return `[${origin}][${source}] ${content}`;
    }

    if (threadId >= 0 && target !== "") {
      return `[${origin}][${source}/${threadId}] triggering ${target} ${content}`;
    }

    if (threadId < 0 && target !== "") {
      return `[${origin}][${source}] triggering ${target} ${content}`;
    }

    return `[${origin}] ${content}`;
  }

  function getEventIcon(type) {
    switch (type) {
      case "ERROR":
      case "ERROR_ELEMENT":
        return "❌  ";
      case "DEBUG":
        return "🛠️  ";
      case "INFO":
      default:
        return "ℹ️  ";
    }
  }

  return (
    <div className="event-list-container">
      {/* Left Filter Panel in Table Layout */}
      <div className="filter-panel">
        <table className="filter-table">
          <tbody>
            <tr>
              <td><strong>Message Types</strong></td>
              <td>
                <div className="checkbox-column">
                  {EVENT_TYPES.map((type) => (
                    <label key={type}>
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type)}
                        onChange={() =>
                          setSelectedTypes((prev) =>
                            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                          )} />
                      {type}
                    </label>
                  ))}
                </div>
              </td>
            </tr>
            <tr>
              <td><strong>Origin Node</strong></td>
              <td>
                <select
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                >
                  <option value="">All</option>
                  {originNodes.map((origin) => (
                    <option key={origin} value={origin}>
                      {origin}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Right Event List */}
      <div className="event-list">
        {filteredEvents.map((event) => (
          <div key={event._id} className="event-item" onClick={() => setExpandedId(expandedId === event._id ? null : event._id)}>

            <div className={`event-summary ${event.type.toLowerCase()}`}>
              <span className="event-icon">{getEventIcon(event.type)}</span>
              <strong>[{typeToLabel(event.type)}]</strong> {generateEventSummary(event)}
            </div>

            {expandedId === event._id && (
              <div className="event-details">
                <table>
                  <tbody>
                    {Object.entries(event).map(([key, value]) => (
                      <tr key={key}>
                        <td><strong>{key}</strong></td>
                        <td>{typeof value === "object" ? JSON.stringify(value) : value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventList;
