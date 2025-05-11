import React, { useEffect, useState } from "react";
import axios from "axios";
import SessionPopup from "./components/SessionPopup";
import MainLayout from "./components/MainLayout";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);

  // Fetch past session events from backend when session is loaded
  useEffect(() => {
    if (!session || session.isNewSession) return;

    axios
      .get(`http://localhost:5000/api/events?session=${session._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error loading past events:", err));
  }, [session]);

  // WebSocket real-time updates for new session
  useEffect(() => {
    if (!session || !session.isNewSession) return;

    const ws = new WebSocket("ws://localhost:5000");

    ws.onmessage = (event) => {
      try {
        const newEvent = JSON.parse(event.data);
        console.log("🔁 Received WebSocket event:", newEvent);

        setEvents((prev) => [newEvent, ...prev]);
      } catch (err) {
        console.error("❌ Failed to parse WebSocket message:", err);
      }
    };

    ws.onerror = (err) => console.error("WebSocket error:", err);
    ws.onclose = () => console.warn("WebSocket connection closed");

    return () => ws.close();
  }, [session]);

  if (!session) {
    return <SessionPopup onSelect={setSession} />;
  }

  return <MainLayout session={session} events={events} />;
}

export default App;
