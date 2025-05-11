import React from "react";
import EventList from "./EventList";
import ResizablePanel from "./ResizablePanel";

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

  const bottomContent = <EventList events={events} />;

  return <ResizablePanel topContent={topContent} bottomContent={bottomContent} />;
}

export default MainLayout;
