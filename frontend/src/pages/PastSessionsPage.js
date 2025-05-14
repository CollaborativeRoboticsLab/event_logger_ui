import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import ResizableLeftPanel from "../components/ResizableLeftPanel";
import ResizableBottomPanel from "../components/ResizableBottomPanel";
import ResizableMainArea from "../components/ResizableMainArea";
import "./PastSessionsPage.css";

function PastSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/sessions")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

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

  const BottomContent = (
    <EventList events={events} disabled={!selected} />
  );

  return (
    <div className="page-layout">
      <ResizableLeftPanel>
        {LeftPanelContent}
      </ResizableLeftPanel>

      <div className="main-right">
        <ResizableBottomPanel
          topContent={<ResizableMainArea />}
          bottomContent={BottomContent}
        />
      </div>
    </div>
  );
}

export default PastSessionsPage;
