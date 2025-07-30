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
    // Get graph count first
    axios
      .get(`http://localhost:5000/api/graphs/${selectedSession._id}/count`)
      .then((res) => {
        console.log("Graph count response:", res.data);

        const count = res.data.count;

        setGraphs(Array(count).fill(null)); // Placeholder
        setGraphIndex(0);

        // Load the first graph
        if (count > 0) {
          fetchGraphByIndex(0, selectedSession._id);
        }
      })
      .catch((err) => console.error("Failed to load graph count", err));
  }, [selectedSession]);


  const fetchGraphByIndex = (index, sessionId) => {
    axios
      .get(`http://localhost:5000/api/graphs/${sessionId}/${index}`)
      .then((res) => {
        if (!res.data) return;
        setGraphs((prev) => {
          const updated = [...prev];
          updated[index] = res.data;
          console.log(`Graph at index ${index} loaded:`, res.data);
          return updated;
        });
      })
      .catch((err) => console.error(`Failed to load graph at index ${index}`, err));
  };

  const currentGraph = graphs[graphIndex];

  return (
    <div className="page-layout">
      <div className="main-content">
        <ResizablePanel
          topContent={
            <div style={{ position: "relative", height: "100%" }}>
              {currentGraph === null ? (
                <p style={{ padding: "1rem" }}>Loading graph...</p>
              ) : currentGraph ? (
                <>
                  <GraphTimelinePlayer graph={currentGraph} />
                  <SessionControl
                    graphIndex={graphIndex}
                    graphCount={graphs.length}
                    currentGraph={currentGraph}
                    onPrev={() => {
                      const newIndex = graphIndex - 1;
                      setGraphIndex(newIndex);
                      if (!graphs[newIndex]) fetchGraphByIndex(newIndex, selectedSession._id);
                    }}
                    onNext={() => {
                      const newIndex = graphIndex + 1;
                      setGraphIndex(newIndex);
                      if (!graphs[newIndex]) fetchGraphByIndex(newIndex, selectedSession._id);
                    }}
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
