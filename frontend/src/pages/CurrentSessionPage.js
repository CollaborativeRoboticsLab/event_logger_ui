import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import ResizableLeftPanel from "../components/ResizableLeftPanel";
import ResizableBottomPanel from "../components/ResizableBottomPanel";
import GraphCanvas from "../components/GraphCanvas"; // Make sure this file exists
import "./CurrentSessionPage.css";

function CurrentSessionPage() {
  const [session, setSession] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [events, setEvents] = useState([]);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphEdges, setGraphEdges] = useState([]);


  // Load existing session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("liveSession");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSession(parsed);
    }
  }, []);

  // Fetch events for resumed past session
  useEffect(() => {
    if (!session || session.isNewSession) return;

    axios.get(`http://localhost:5000/api/events?session=${session._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Failed to load events:", err));
  }, [session]);

  // WebSocket for live session
  useEffect(() => {
    if (!session || !session.isNewSession) return;

    const frontend_socket = new WebSocket("ws://localhost:5000");

    frontend_socket.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);

      // ✅ Check this log
      console.log("🔁 Received WS Event:", newEvent);

      setEvents((prev) => [newEvent, ...prev]);

      if (newEvent.type === "RUNNER_DEFINE") {
        const fromKey = `${newEvent.source.capability}:${newEvent.source.provider}`;
        const toKey = `${newEvent.target.capability}:${newEvent.target.provider}`;

        if (!newEvent.target.capability) return; // skip if no target

        setGraphNodes((prev) => {
          const keys = prev.map(n => `${n.capability}:${n.provider}`);
          const addNode = (cap, prov) =>
            keys.includes(`${cap}:${prov}`) ? [] : [{ id: `${cap}:${prov}`, capability: cap, provider: prov, state: "idle" }];
          return [...prev, ...addNode(newEvent.source.capability, newEvent.source.provider), ...addNode(newEvent.target.capability, newEvent.target.provider)];
        });

        setGraphEdges((prev) => {
          const exists = prev.find(
            (e) =>
              e.source.capability === newEvent.source.capability &&
              e.source.provider === newEvent.source.provider &&
              e.target.capability === newEvent.target.capability &&
              e.target.provider === newEvent.target.provider
          );
          if (exists) return prev;
          return [...prev, {
            source: { ...newEvent.source },
            target: { ...newEvent.target },
            activated: 0,
          }];
        });
      }

      if (newEvent.type === "RUNNER_EVENT") {
        const srcKey = `${newEvent.source.capability}:${newEvent.source.provider}`;
        const tgtKey = `${newEvent.target.capability}:${newEvent.target.provider}`;

        setGraphEdges((edges) =>
          edges.map((e) => {
            if (
              `${e.source.capability}:${e.source.provider}` === srcKey &&
              `${e.target.capability}:${e.target.provider}` === tgtKey
            ) {
              return { ...e, activated: (e.activated || 0) + 1 };
            }
            return e;
          })
        );

        setGraphNodes((nodes) =>
          nodes.map((n) => {
            const key = `${n.capability}:${n.provider}`;
            if (key === srcKey) return { ...n, state: "complete" };
            if (key === tgtKey) return { ...n, state: "executing" };
            return n;
          })
        );
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
    localStorage.removeItem("liveSession");
  };

  const isSessionActive = !!session;
  const isLiveSession = session?.isNewSession;

  const LeftPanelContent = (
    <div>
      <h3>Start New Session</h3>
      <input
        type="text"
        value={sessionName}
        placeholder="Enter session name"
        onChange={(e) => setSessionName(e.target.value)}
        disabled={isSessionActive}
      />
      <button onClick={handleStart} disabled={!sessionName.trim() || isSessionActive}>
        Start
      </button>
      <button onClick={handleStop} disabled={!isSessionActive}>
        Stop
      </button>
    </div>
  );

  const BottomContent = (
    <EventList events={events} disabled={!isSessionActive} />
  );

  return (
    <div className="page-layout">
      <ResizableLeftPanel>
        {LeftPanelContent}
      </ResizableLeftPanel>

      <div className="main-content-area">
        <ResizableBottomPanel
          topContent={
            isLiveSession ? (
              <GraphCanvas nodes={graphNodes} links={graphEdges} />
            ) : (
              <div style={{ padding: "1rem", textAlign: "center" }}>
                <p>No active session. Start one from the left panel.</p>
              </div>
            )
          }
          bottomContent={BottomContent}
        />

      </div>
    </div>
  );
}

export default CurrentSessionPage;
