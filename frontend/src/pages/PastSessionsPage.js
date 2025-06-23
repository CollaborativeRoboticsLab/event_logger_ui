import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import GraphTimelinePlayer from "../components/GraphTimelinePlayer";
import ResizableLeftPanel from "../components/ResizableLeftPanel";
import ResizableBottomPanel from "../components/ResizableBottomPanel";
import "./PastSessionsPage.css";

function PastSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [graphs, setGraphs] = useState([]);
  const [graphIndex, setGraphIndex] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/api/sessions")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

  useEffect(() => {
    if (!selectedSession) return;

    axios.get(`http://localhost:5000/api/events?session=${selectedSession._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to load session events", err));

    axios.get(`http://localhost:5000/api/graphs/${selectedSession._id}`)
      .then((res) => {
        setGraphs(res.data);
        setGraphIndex(0); // Reset to first graph when switching sessions
      })
      .catch((err) => console.error("Failed to load graphs", err));
  }, [selectedSession]);

  const currentGraph = graphs[graphIndex];

  const LeftPanelContent = (
    <div>
      <h3>Load Past Session</h3>
      {sessions.map((s) => (
        <div
          key={s._id}
          onClick={() => setSelectedSession(s)}
          className={`session-list-item ${selectedSession?._id === s._id ? "selected" : ""}`}
        >
          <strong>{s.name}</strong> #{s.serial}<br />
          <small>{new Date(s.createdAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );

  const BottomContent = (
    <EventList events={events} disabled={!selectedSession} />
  );

  const TopContent = (
    <div className="graph-controls">
      {currentGraph ? (
          <div style={{ position: "relative", height: "100%" }}>
            <GraphTimelinePlayer graph={currentGraph} />
            <div className="floating-right">
              <button disabled={graphIndex <= 0} onClick={() => setGraphIndex(i => i - 1)}>↑ Prev Graph</button>
              <span>Graph {currentGraph.graphNumber}</span>
              <button disabled={graphIndex >= graphs.length - 1} onClick={() => setGraphIndex(i => i + 1)}>↓ Next Graph</button>
            </div>
          </div>
      ) : (
        <p style={{ padding: "1rem" }}>No graph available for this session.</p>
      )}
    </div>
  );

  return (
    <div className="page-layout">
      <ResizableLeftPanel>
        {LeftPanelContent}
      </ResizableLeftPanel>

      <div className="main-right">
        <ResizableBottomPanel
          topContent={TopContent}
          bottomContent={BottomContent}
        />
      </div>
    </div>
  );
}

export default PastSessionsPage;
