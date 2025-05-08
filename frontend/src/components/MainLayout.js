import React, { useState } from "react";
import EventList from "./EventList";
import PanelToggle from "./PanelToggle";
import "./MainLayout.css";

function MainLayout({ session, events }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div className="main-container">
      {/* Side Panel */}
      <div className={`side-panel ${isPanelOpen ? "open" : "closed"}`}>
        {isPanelOpen && <EventList events={events} />}
      </div>

      {/* Toggle Button */}
      <PanelToggle isOpen={isPanelOpen} onToggle={() => setIsPanelOpen(!isPanelOpen)} />

      {/* Main Content */}
      <div className="main-content">
        <h1>Capabilities2 Event Viewer</h1>
        <p>
          🟢 Session: <strong>{session.name}</strong> (#{session.serial}) —{" "}
          {new Date(session.createdAt).toLocaleString()}
        </p>
        <p>{events.length} events captured in this session.</p>
      </div>
    </div>
  );
}

export default MainLayout;
