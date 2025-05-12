import React from "react";
import ResizableLeftPanel from "./ResizableLeftPanel";
import ResizableBottomPanel from "./ResizableBottomPanel";
import EventList from "./EventList";
import "./MainLayout.css";

function MainLayout({ session, events }) {
  const topContent = (
    <>
      <h1>Capabilities2 Event Viewer</h1>
      <p>
        🟢 Session: <strong>{session.name}</strong> (#{session.serial}) —{" "}
        {new Date(session.createdAt).toLocaleString()}
      </p>
      <p>{events.length} events captured in this session.</p>
    </>
  );

  return (
    <div className="main-layout">
      <ResizableLeftPanel />
      <ResizableBottomPanel topContent={topContent} bottomContent={<EventList events={events} />} />
    </div>
  );
}

export default MainLayout;
