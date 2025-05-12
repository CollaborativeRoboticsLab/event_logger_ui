import React, { useRef, useState } from "react";
import "./ResizableLeftPanel.css";

function ResizableLeftPanel({ defaultWidth = 250, minWidth = 120, children }) {
  const [width, setWidth] = useState(() => window.innerWidth * 0.15);
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
    setWidth(Math.max(minWidth, e.clientX));
  };

  return (
    <div
      className="left-panel-container"
      onMouseMove={handleMouseMove}
      onMouseUp={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div className="left-panel" style={{ width: `${width}px` }}>
        <div className="left-panel-content">
          {children /* ✅ show content passed from page */}
        </div>
      </div>
      <div className="left-panel-resizer" onMouseDown={startDragging} />
    </div>
  );
}

export default ResizableLeftPanel;
