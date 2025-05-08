import React from "react";
import "./PanelToggle.css";

function PanelToggle({ isOpen, onToggle }) {
  return (
    <div
      className={`panel-toggle-vertical ${isOpen ? "open" : "closed"}`}
      onClick={onToggle}
      title={isOpen ? "Collapse panel" : "Expand panel"}
    >
      {isOpen ? "<" : ">"}
    </div>
  );
}

export default PanelToggle;
