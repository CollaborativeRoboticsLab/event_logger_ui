import React, { useRef, useState } from "react";
import "./ResizableBottomPanel.css";

function ResizableBottomPanel({ topContent, bottomContent, minHeight = 100, defaultHeight = 250 }) {
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
    <div
      className="bottom-panel-layout"
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div className="top-section" style={{ height: `calc(100% - ${height}px)` }}>
        {topContent /* ✅ show top panel */}
      </div>
      <div className="horizontal-resizer" onMouseDown={startDragging} />
      <div className="bottom-panel" style={{ height: `${height}px` }}>
        {bottomContent /* ✅ show bottom panel */}
      </div>
    </div>
  );
}

export default ResizableBottomPanel;
