import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [events, setEvents] = useState([]);

  // Fetch initial events from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/events")
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:5000");

    ws.onopen = () => {
      console.log("📡 WebSocket connected");
    };

    ws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      setEvents((prevEvents) => [newEvent, ...prevEvents]);
    };

    ws.onclose = () => {
      console.log("🔌 WebSocket disconnected");
    };

    ws.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Capabilities2 Event Viewer</h1>
      <p>Live updates from <code>foxglove-rosbridge</code> via WebSocket</p>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {events.map((event) => (
          <li
            key={event._id}
            style={{
              marginBottom: "10px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              background: "#f9f9f9",
            }}
          >
            <strong>{event.origin_node}</strong> → {event.content}  
            <br />
            <small>PID: {event.pid} | Thread: {event.thread_id} | Type: {event.type}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
