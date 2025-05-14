import React from "react";
import "./ResizableMainArea.css";

function ResizableMainArea({ children }) {
  return (
    <div className="main-area">
      {children /* ✅ Graph canvas or dynamic content goes here */}
    </div>
  );
}

export default ResizableMainArea;