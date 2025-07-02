import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import GraphCanvas from "../components/GraphCanvas";
import ResizablePanel from "../components/ResizablePanel";
import "./CurrentSessionPage.css";

function CurrentSessionPage() {
  const [session, setSession] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [events, setEvents] = useState([]);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);

  // Load saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem("liveSession");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSession(parsed);
    }
  }, []);

  // Load events for resumed session
  useEffect(() => {
    if (!session || session.isNewSession) return;

    axios
      .get(`http://localhost:5000/api/events?session=${session._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to load events:", err));
  }, [session]);

  // Live session WebSocket
  useEffect(() => {
    if (!session || !session.isNewSession) return;

    const frontend_socket = new WebSocket("ws://localhost:5000");

    frontend_socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("🔁 Received WS Message:", message);

      if (message.type === "GRAPH_UPDATE") {
        const { graph } = message;

        if (!graph) {
          console.warn("GRAPH_UPDATE received with no graph data:", message);
          return;
        }

        // Convert nodeId → string ID format
        const nodeMap = new Map();
        const convertedNodes = graph.nodes.map(n => {
          const id = `${n.capability}:${n.provider}`;
          nodeMap.set(n.nodeId, id);
          return {
            ...n,
            id,
            state: "idle",
          };
        });

        const convertedEdges = graph.edges.map(e => ({
          ...e,
          source: nodeMap.get(e.sourceNodeID),
          target: nodeMap.get(e.targetNodeID),
          activated: 0,
        }));

        setGraphNodes(convertedNodes);
        setGraphEdges(convertedEdges);
      } else {
        setEvents((prev) => [message, ...prev]);
      }
    };

    frontend_socket.onerror = (err) => console.error("WebSocket error:", err);
    return () => frontend_socket.close();
  }, [session]);

  const handleStart = async () => {
    if (!sessionName.trim()) return;
    try {
      const res = await axios.post("http://localhost:5000/api/sessions?listen=true", {
        name: sessionName,
      });
      const newSession = { ...res.data, isNewSession: true };
      setSession(newSession);
      setEvents([]);
      localStorage.setItem("liveSession", JSON.stringify(newSession));
    } catch (err) {
      console.error("Failed to start session:", err);
    }
  };

  const handleStop = () => {
    setSession(null);
    setEvents([]);
    setGraphNodes([]);
    setGraphEdges([]);
    localStorage.removeItem("liveSession");
  };

  const isSessionActive = !!session;
  const isLiveSession = session?.isNewSession;

  const LeftContent = (
    <div className="left-panel-content">
      <div className="session-controls">
        <h3>Create Session :</h3>
        <input
          type="text"
          value={sessionName}
          placeholder="Enter session name"
          onChange={(e) => setSessionName(e.target.value)}
          disabled={isSessionActive}
        />
        <button onClick={handleStart} disabled={!sessionName.trim() || isSessionActive}>
          Start Session
        </button>
        <button onClick={handleStop} disabled={!isSessionActive}>
          Stop Session
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-layout">
      <div className="main-content-area">
        <ResizablePanel
          topContent={
            isLiveSession ? (
              <GraphCanvas nodes={graphNodes} links={graphEdges} />
            ) : (
              <div style={{ padding: "1rem", textAlign: "center" }}>
                <p>No active session. Start one below.</p>
              </div>
            )
          }
          leftContent={LeftContent}
          rightContent={<EventList events={events} disabled={!isSessionActive} />}
        />
      </div>
    </div>
  );
}

export default CurrentSessionPage;
