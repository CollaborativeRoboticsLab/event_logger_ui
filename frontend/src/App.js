// frontend/src/App.js
import React, { useEffect, useState } from "react";
import SessionPopup from "./components/SessionPopup";
import MainLayout from "./components/MainLayout";
import axios from "axios";
import "./App.css";

function App() {
  const [session, setSession] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!session || session.isNewSession) return;
    axios
      .get(`http://localhost:5000/api/events?session=${session._id}`)
      .then((res) => setEvents(res.data))
      .catch((err) => console.error("Error loading past events:", err));
  }, [session]);

  useEffect(() => {
    if (!session || !session.isNewSession) return;
    const ws = new WebSocket("ws://localhost:5000");
    ws.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      if (newEvent.session === session._id) {
        setEvents((prev) => [newEvent, ...prev]);
      }
    };
    ws.onerror = (err) => console.error("WebSocket error:", err);
    return () => ws.close();
  }, [session]);

  if (!session) return <SessionPopup onSelect={setSession} />;

  return <MainLayout session={session} events={events} />;
}

export default App;
