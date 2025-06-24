import React, { useRef, useState } from "react";
import "./ResizablePanel.css";

function ResizablePanel({ leftContent, rightContent, minHeight = 100, defaultHeight = 235 }) {
  const [height, setHeight] = useState(defaultHeight);
  const isDragging = useRef(false);

  const startDragging = (e) => {
    isDragging.current = true;
    e.preventDefault();
  };

  const stopDragging = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const container = e.currentTarget.getBoundingClientRect();
    const newHeight = container.bottom - e.clientY;
    setHeight(Math.max(minHeight, newHeight));
  };

  return (
    <div className="bottom-panel-layout" onMouseMove={handleMouseMove} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
      <div className="top-section" style={{ height: `calc(100% - ${height}px)` }} />
      <div className="horizontal-resizer" onMouseDown={startDragging} />
      <div className="bottom-panel" style={{ height: `${height}px`, display: "flex" }}>
        <div className="bottom-left">{leftContent}</div>
        <div className="bottom-right">{rightContent}</div>
      </div>
    </div>
  );
}

export default ResizablePanel;
