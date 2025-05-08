import React, { useState } from "react";
import "./EventList.css";

function EventList({ events }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="event-list">
      {events.map((event) => (
        <div
          key={event._id}
          className="event-item"
          onClick={() => setExpandedId(expandedId === event._id ? null : event._id)}
        >
          <div className="event-summary">
            <strong>{event.content}</strong>
          </div>
          {expandedId === event._id && (
            <div className="event-details">
              <pre>{JSON.stringify(event, null, 2)}</pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default EventList;
