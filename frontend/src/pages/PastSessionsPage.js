import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import ResizableLeftPanel from "../components/ResizableLeftPanel";
import ResizableBottomPanel from "../components/ResizableBottomPanel";
import "./PastSessionsPage.css";

function PastSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);

  // Fetch session list
  useEffect(() => {
    axios.get("http://localhost:5000/api/sessions")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

  // Fetch events when a session is selected
  useEffect(() => {
    if (!selected) return;
    axios.get(`http://localhost:5000/api/events?session=${selected._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to load session events", err));
  }, [selected]);

  const LeftPanelContent = (
    <div>
      <h3>Load Past Session</h3>
      {sessions.map((s) => (
        <div key={s._id} onClick={() => setSelected(s)} className="session-list-item">
          <strong>{s.name}</strong> #{s.serial}<br />
          <small>{new Date(s.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );

  const TopContent = selected ? (
    <>
      <h1>Past Session</h1>
      <p>📁 <strong>{selected.name}</strong> (#{selected.serial}) — {new Date(selected.createdAt).toLocaleString()}</p>
    </>
  ) : (
    <p>Select a session from the left panel.</p>
  );

  const BottomContent = selected ? (
    <EventList events={events} />
  ) : null;

  return (
    <div className="page-layout">
      <ResizableLeftPanel>
        {LeftPanelContent}
      </ResizableLeftPanel>

      <div className="main-content-area">
        <ResizableBottomPanel
          topContent={TopContent}
          bottomContent={BottomContent}
        />
      </div>
    </div>
  );
}

export default PastSessionsPage;
