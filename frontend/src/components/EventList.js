import React, { useState, useMemo } from "react";
import EventItem from "./EventItem";
import "./EventList.css";

const EVENT_TYPES = ["INFO", "DEBUG", "ERROR", "ERROR_ELEMENT", "RUNNER_DEFINE", "RUNNER_EVENT"];

function EventList({ events, disabled = false  }) {
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
    return events
      .filter(
        (e) =>
          selectedTypes.includes(e.type) &&
          (!selectedOrigin || e.origin_node === selectedOrigin)
      )
      .sort((a, b) => {
        const aSec = a.header?.stamp?.sec ?? 0;
        const aNano = a.header?.stamp?.nanosec ?? 0;
        const bSec = b.header?.stamp?.sec ?? 0;
        const bNano = b.header?.stamp?.nanosec ?? 0;
  
        if (aSec !== bSec) return bSec - aSec; // newest first
        return bNano - aNano;
      });
  }, [events, selectedTypes, selectedOrigin]);

  const handleItemClick = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="event-list-container">
      {/* Always visible filter panel */}
      <div className="filter-panel">
        <fieldset disabled={disabled} className={disabled ? "disabled-filters" : ""}>
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
                          onChange={() => toggleType(type)}
                        />
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
        </fieldset>
      </div>

      <div className="event-list">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <EventItem
              key={event._id}
              event={event}
              isExpanded={expandedId === event._id.toString()}
              onClick={(id) => handleItemClick(id.toString())}
            />
          ))
        ) : (
          <div className="no-events-message">
            <p>No events available for this session.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventList;
