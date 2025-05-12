import React, { useState, useEffect } from "react";
import axios from "axios";
import EventList from "../components/EventList";
import ResizableLeftPanel from "../components/ResizableLeftPanel";
import ResizableBottomPanel from "../components/ResizableBottomPanel";
import "./CurrentSessionPage.css";

function CurrentSessionPage() {
  const [session, setSession] = useState(null);
  const [sessionName, setSessionName] = useState("");
  const [events, setEvents] = useState([]);

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

  const TopContent = session ? (
    <>
      <h1>Live Session</h1>
      <p>🟢 <strong>{session.name}</strong> (#{session.serial}) — {new Date(session.createdAt).toLocaleString()}</p>
    </>
  ) : (
    <p>No active session. Start one from the left panel.</p>
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
          topContent={TopContent}
          bottomContent={BottomContent}
        />
      </div>
    </div>
  );
}

export default CurrentSessionPage;
