import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import GraphTimelinePlayer from "../components/GraphTimelinePlayer";
import ResizablePanel from "../components/ResizablePanel";
import SessionSelector from "../components/SessionSelector";
import SessionControl from "../components/SessionControl";
import "./PastSessionsPage.css";

function PastSessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [events, setEvents] = useState([]);
  const [graphs, setGraphs] = useState([]);
  const [graphIndex, setGraphIndex] = useState(0);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/sessions")
      .then((res) => setSessions(res.data))
      .catch((err) => console.error("Failed to load sessions", err));
  }, []);

  useEffect(() => {
    if (!selectedSession) return;

    // Load past events
    axios
      .get(`http://localhost:5000/api/events?session=${selectedSession._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to load session events", err));

    // Load past graphs
    axios
      .get(`http://localhost:5000/api/graphs/${selectedSession._id}`)
      .then((res) => {
        setGraphs(res.data);
        setGraphIndex(0);
      })
      .catch((err) => console.error("Failed to load graphs", err));
  }, [selectedSession]);

  const currentGraph = graphs[graphIndex];

  return (
    <div className="page-layout">
      <div className="main-content">
        <ResizablePanel
          topContent={
            <div style={{ position: "relative", height: "100%" }}>
              {currentGraph ? (
                <>
                  <GraphTimelinePlayer graph={currentGraph} />
                  <SessionControl
                    graphIndex={graphIndex}
                    graphCount={graphs.length}
                    currentGraph={currentGraph}
                    onPrev={() => setGraphIndex((i) => i - 1)}
                    onNext={() => setGraphIndex((i) => i + 1)}
                  />
                </>
              ) : (
                <p style={{ padding: "1rem" }}>No graph available for this session.</p>
              )}
            </div>
          }
          leftContent={
            <SessionSelector
              sessions={sessions}
              selectedSession={selectedSession}
              onSelect={setSelectedSession}
            />
          }
          rightContent={
            <EventList events={events} disabled={!selectedSession} />
          }
        />
      </div>
    </div>
  );
}

export default PastSessionsPage;
